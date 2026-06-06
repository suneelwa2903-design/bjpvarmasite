import { Storage } from '@google-cloud/storage'

const PUBLIC_BUCKET = process.env.GCS_PUBLIC_BUCKET || ''
const PRIVATE_BUCKET = process.env.GCS_PRIVATE_BUCKET || ''

let storage: Storage | null = null

function getStorage(): Storage {
  if (!storage) {
    storage = new Storage()
  }
  return storage
}

export async function uploadToPublicBucket(
  file: Buffer | Uint8Array,
  key: string,
  contentType: string
): Promise<string> {
  if (!PUBLIC_BUCKET) {
    throw new Error('GCS_PUBLIC_BUCKET environment variable is not set')
  }
  const bucket = getStorage().bucket(PUBLIC_BUCKET)
  await bucket.file(key).save(Buffer.from(file as Uint8Array), {
    contentType,
    resumable: false,
  })
  return `https://storage.googleapis.com/${PUBLIC_BUCKET}/${key}`
}

export async function uploadToPrivateBucket(
  file: Buffer | Uint8Array,
  key: string,
  contentType: string
): Promise<string> {
  if (!PRIVATE_BUCKET) {
    throw new Error('GCS_PRIVATE_BUCKET environment variable is not set')
  }
  const bucket = getStorage().bucket(PRIVATE_BUCKET)
  await bucket.file(key).save(Buffer.from(file as Uint8Array), {
    contentType,
    resumable: false,
  })
  return key
}

export async function deleteFromBucket(bucketName: string, key: string): Promise<void> {
  if (!bucketName) throw new Error('bucketName is required')
  await getStorage().bucket(bucketName).file(key).delete({ ignoreNotFound: true })
}

export async function getSignedReadUrl(
  bucketName: string,
  key: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  if (!bucketName) throw new Error('bucketName is required')
  const [url] = await getStorage()
    .bucket(bucketName)
    .file(key)
    .getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + expiresInSeconds * 1000,
    })
  return url
}

export function generateStorageKey(folder: string, originalFilename: string): string {
  const timestamp = Date.now()
  const ext = originalFilename.includes('.')
    ? originalFilename.substring(originalFilename.lastIndexOf('.'))
    : ''
  const baseName = originalFilename
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
  const cleanFolder = folder.replace(/^\/+|\/+$/g, '')
  return `${cleanFolder}/${baseName}-${timestamp}${ext}`
}

// A stored attachment value is renderable as-is when it's already a URL
// (legacy https://... rows, or local-dev paths like /uploads/mib/...).
// Otherwise it's a GCS object key in the private bucket and must be signed.
function looksLikeUrl(value: string): boolean {
  return /^https?:\/\//i.test(value) || value.startsWith('/')
}

export async function signIfPrivateKey(
  value: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  if (!value) return value
  if (looksLikeUrl(value)) return value
  if (!PRIVATE_BUCKET) return value
  return getSignedReadUrl(PRIVATE_BUCKET, value, expiresInSeconds)
}

export async function signAttachments<T extends { storageUrl: string }>(
  items: T[],
  expiresInSeconds: number = 3600
): Promise<T[]> {
  return Promise.all(
    items.map(async (a) => ({
      ...a,
      storageUrl: await signIfPrivateKey(a.storageUrl, expiresInSeconds),
    }))
  )
}
