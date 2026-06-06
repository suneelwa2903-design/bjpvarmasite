import { NextRequest, NextResponse } from 'next/server'
import { uploadToPublicBucket, generateStorageKey } from '@/lib/storage'
import { isSessionValid } from '@/lib/auth'
import { processImage, getImageOptions, isImageFile } from '@/lib/image-utils'
import fs from 'fs'
import path from 'path'

// Use Cloud Storage (public bucket) in production, local filesystem in development.
const USE_CLOUD_STORAGE = Boolean(process.env.GCS_PUBLIC_BUCKET)

// Image specifications based on analysis
const IMAGE_SPECS = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  recommendedDimensions: {
    width: 1920,
    height: 1080,
    aspectRatio: 16/9
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    if (!(await isSessionValid())) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('image') as File
    const type = formData.get('type') as string // 'slideshow', 'initiative', 'press', etc.

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Validate file type (press allows PDF too)
    const isPress = type === 'press'
    const allowedTypes = isPress
      ? [...IMAGE_SPECS.allowedTypes, 'application/pdf']
      : IMAGE_SPECS.allowedTypes
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: isPress ? 'Invalid file type. Only JPG, PNG, WebP, and PDF are allowed for press.' : 'Invalid file type. Only JPG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > IMAGE_SPECS.maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

        const bytes = await file.arrayBuffer()
        const originalBuffer = Buffer.from(bytes)
        
        // Process image if it's an image file (compress, resize, convert to WebP)
        let processedBuffer: Buffer = originalBuffer
        let processedMimeType = file.type
        let processedFileName = file.name
        let imageDimensions: { width?: number; height?: number } = {}
        
        if (isImageFile(file.type)) {
          try {
            const options = getImageOptions(type)
            const processed = await processImage(originalBuffer, file.type, options)
            processedBuffer = processed.buffer as Buffer
            processedMimeType = processed.mimeType
            imageDimensions = {
              width: processed.width,
              height: processed.height,
            }
        
        // Update file extension to match output format
        if (processed.mimeType === 'image/webp') {
          processedFileName = file.name.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp')
        }
      } catch (error) {
        console.error('Image processing failed, using original:', error)
        // Fall back to original if processing fails
      }
    }
    
    const timestamp = Date.now()
    const fileExtension = path.extname(processedFileName)
    const fileName = `${type || 'upload'}-${timestamp}${fileExtension}`

    let url: string
    const originalSize = originalBuffer.length
    const processedSize = processedBuffer.length
    const compressionRatio = originalSize > 0 ? ((originalSize - processedSize) / originalSize * 100).toFixed(1) : '0'

    if (USE_CLOUD_STORAGE) {
      // Upload to GCS public bucket — returned URL is the public HTTPS URL.
      const folder = isPress
        ? 'press'
        : (type ? `images/admin/${type}` : 'images/admin')
      const objectKey = generateStorageKey(folder, processedFileName)
      url = await uploadToPublicBucket(processedBuffer, objectKey, processedMimeType)
    } else {
      // Local filesystem (development)
      const baseDir = isPress
        ? path.join(process.cwd(), 'public', 'press')
        : path.join(process.cwd(), 'public', 'images', 'admin')
      const targetDir = isPress
        ? baseDir
        : (type ? path.join(baseDir, type) : baseDir)
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true })
      }
      const filePath = path.join(targetDir, fileName)
      fs.writeFileSync(filePath, processedBuffer)

      // Return the public URL
      url = isPress
        ? `/press/${fileName}`
        : (type ? `/images/admin/${type}/${fileName}` : `/images/admin/${fileName}`)
    }

    return NextResponse.json({
      success: true,
      url,
      fileName: fileName,
      size: processedSize,
      originalSize: isImageFile(file.type) ? originalSize : undefined,
      compressionRatio: isImageFile(file.type) ? `${compressionRatio}%` : undefined,
      type: processedMimeType,
      dimensions: {
        ...(imageDimensions.width && imageDimensions.height ? {
          width: imageDimensions.width,
          height: imageDimensions.height,
        } : {}),
        recommended: IMAGE_SPECS.recommendedDimensions
      }
    })

  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}
