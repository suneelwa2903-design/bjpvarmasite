import sharp from 'sharp'

/**
 * Image processing options
 */
export interface ImageProcessOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
  preserveAspectRatio?: boolean
}

/**
 * Default image processing options
 */
const DEFAULT_OPTIONS: Required<ImageProcessOptions> = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 85,
  format: 'webp',
  preserveAspectRatio: true,
}

/**
 * Check if a file is an image that can be processed
 */
export function isImageFile(mimeType: string): boolean {
  return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'].includes(mimeType)
}

/**
 * Process and compress an image using Sharp
 * 
 * @param buffer - Image buffer
 * @param mimeType - Original MIME type
 * @param options - Processing options
 * @returns Processed image buffer and new MIME type
 */
export async function processImage(
  buffer: Buffer | Uint8Array,
  mimeType: string,
  options: ImageProcessOptions = {}
): Promise<{ buffer: Buffer; mimeType: string; width?: number; height?: number }> {
  // Only process image files
  if (!isImageFile(mimeType)) {
    // Ensure buffer is a Buffer instance
    const bufferInstance = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer)
    return { buffer: bufferInstance, mimeType }
  }

  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  try {
    // Create Sharp instance
    let pipeline = sharp(buffer)

    // Get image metadata
    const metadata = await pipeline.metadata()
    const originalWidth = metadata.width || 0
    const originalHeight = metadata.height || 0

    // Resize if needed (maintain aspect ratio)
    if (opts.preserveAspectRatio) {
      if (originalWidth > opts.maxWidth || originalHeight > opts.maxHeight) {
        pipeline = pipeline.resize(opts.maxWidth, opts.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        })
      }
    } else {
      pipeline = pipeline.resize(opts.maxWidth, opts.maxHeight, {
        fit: 'cover',
        withoutEnlargement: true,
      })
    }

    // Convert to desired format and compress
    let processedBuffer: Buffer
    let outputMimeType: string
    let outputWidth: number | undefined
    let outputHeight: number | undefined

    if (opts.format === 'webp') {
      processedBuffer = await pipeline
        .webp({ quality: opts.quality, effort: 4 })
        .toBuffer()
      outputMimeType = 'image/webp'
    } else if (opts.format === 'jpeg') {
      processedBuffer = await pipeline
        .jpeg({ quality: opts.quality, mozjpeg: true })
        .toBuffer()
      outputMimeType = 'image/jpeg'
    } else if (opts.format === 'png') {
      processedBuffer = await pipeline
        .png({ quality: opts.quality, compressionLevel: 9 })
        .toBuffer()
      outputMimeType = 'image/png'
    } else {
      // Fallback to WebP
      processedBuffer = await pipeline
        .webp({ quality: opts.quality, effort: 4 })
        .toBuffer()
      outputMimeType = 'image/webp'
    }

    // Get final dimensions
    const finalMetadata = await sharp(processedBuffer).metadata()
    outputWidth = finalMetadata.width
    outputHeight = finalMetadata.height

    return {
      buffer: processedBuffer,
      mimeType: outputMimeType,
      width: outputWidth,
      height: outputHeight,
    }
  } catch (error) {
    console.error('Image processing error:', error)
    // If processing fails, return original buffer (ensure it's a Buffer)
    const bufferInstance = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer)
    return { buffer: bufferInstance, mimeType }
  }
}

/**
 * Get optimal image processing options based on upload type
 */
export function getImageOptions(type?: string): ImageProcessOptions {
  // For slideshow images, prioritize quality
  if (type === 'slideshow') {
    return {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 90,
      format: 'webp',
    }
  }

  // For initiative images, balance quality and size
  if (type === 'initiative') {
    return {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 85,
      format: 'webp',
    }
  }

  // For press releases, allow higher quality for readability
  if (type === 'press') {
    return {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 90,
      format: 'webp',
    }
  }

  // Default options for other types
  return {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 85,
    format: 'webp',
  }
}

