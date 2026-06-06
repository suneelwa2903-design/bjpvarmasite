import { NextRequest, NextResponse } from 'next/server'
import { uploadToPrivateBucket, generateStorageKey } from '@/lib/storage'
import { processImage, isImageFile } from '@/lib/image-utils'
import { getMibCitizenSession } from '@/lib/mibCitizenSession'
import { getOfficeSessionUser } from '@/lib/officeAuth'
import { isSessionValid } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

// Use Cloud Storage (private bucket) in production, local filesystem in development.
// The response returns a `key` (object key for the private bucket), not a URL —
// the client stores it in MibTicketAttachment.storageUrl and the server signs on read.
const USE_CLOUD_STORAGE = Boolean(process.env.GCS_PRIVATE_BUCKET)

// Accept any of the three session cookies — citizens attaching evidence to
// their own tickets, office staff attaching internal docs, or admins editing
// CMS-adjacent ticket data. Anonymous → 401 (closes the previous storage-DoS
// vector where any internet visitor could fill the bucket).
async function isAnySessionAuthenticated(): Promise<boolean> {
  const [citizen, office, admin] = await Promise.all([
    getMibCitizenSession(),
    getOfficeSessionUser(),
    isSessionValid(),
  ])
  return Boolean(citizen) || Boolean(office) || admin
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAnySessionAuthenticated())) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('image') as File
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    // Allow common safe types: images + PDF + Word + Excel + CSV + Text
    const allowed = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'text/plain'
    ]
    if (!allowed.includes(file.type)) return NextResponse.json({ error: 'Unsupported type' }, { status: 400 })
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'File too large' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const originalBuffer = Buffer.from(bytes)
    
    // Process image if it's an image file (compress, resize, convert to WebP)
    // Non-image files (PDF, Word, Excel, etc.) are passed through unchanged
    let processedBuffer: Buffer = originalBuffer
    let processedMimeType = file.type
    let processedFileName = file.name
    
    if (isImageFile(file.type)) {
      try {
        // For MIB uploads, use default compression settings
        const processed = await processImage(originalBuffer, file.type, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 85,
          format: 'webp',
        })
        processedBuffer = processed.buffer as Buffer
        processedMimeType = processed.mimeType
        
        // Update file extension to match output format
        if (processed.mimeType === 'image/webp') {
          processedFileName = file.name.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp')
        }
      } catch (error) {
        console.error('Image processing failed, using original:', error)
        // Fall back to original if processing fails
      }
    }
    
    const ext = path.extname(processedFileName) || (processedMimeType === 'application/pdf' ? '.pdf' : '.bin')
    const fileName = `mib-${Date.now()}${ext}`

    // `key` is the GCS object key in prod, or a local-dev path like /uploads/mib/foo.png.
    // Either way, this is what the client stores in MibTicketAttachment.storageUrl.
    let key: string

    if (USE_CLOUD_STORAGE) {
      const objectKey = generateStorageKey('uploads/mib', processedFileName)
      key = await uploadToPrivateBucket(processedBuffer, objectKey, processedMimeType)
    } else {
      // Local filesystem (development)
      const baseDir = path.join(process.cwd(), 'public', 'uploads', 'mib')
      if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true })
      const filePath = path.join(baseDir, fileName)
      fs.writeFileSync(filePath, processedBuffer)
      key = `/uploads/mib/${fileName}`
    }

    return NextResponse.json({
      success: true,
      key,
      ...(isImageFile(file.type) ? {
        originalSize: originalBuffer.length,
        processedSize: processedBuffer.length,
        compressionRatio: `${((originalBuffer.length - processedBuffer.length) / originalBuffer.length * 100).toFixed(1)}%`
      } : {})
    })
  } catch (e: any) {
    console.error('Upload error:', e)
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 })
  }
}
