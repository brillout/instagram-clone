import { fileURLToPath } from 'node:url'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
export const UPLOADS_DIR = path.join(serverRoot, 'uploads')

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}

const MAX_BYTES = 8 * 1024 * 1024 // 8 MB

/**
 * Persist an uploaded image to the uploads directory and return its public
 * URL path (served by the API under /api/uploads). Returns null if the file
 * isn't a supported image or is too large.
 */
export async function saveUploadedImage(file: File): Promise<string | null> {
  if (!file.type.startsWith('image/')) return null
  if (file.size > MAX_BYTES) return null

  const ext = EXT_BY_TYPE[file.type] ?? 'jpg'
  const name = `${crypto.randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  await mkdir(UPLOADS_DIR, { recursive: true })
  await writeFile(path.join(UPLOADS_DIR, name), buffer)

  return `/api/uploads/${name}`
}
