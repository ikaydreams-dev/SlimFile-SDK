import path from 'node:path'
import { ValidationError } from './errors.js'

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
}

export const SUPPORTED_EXTENSIONS = new Set(Object.keys(MIME_MAP))

export function getMimeType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase()
  return MIME_MAP[ext] ?? 'application/octet-stream'
}

export function resolveOutputFileName(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase()
  const base = path.basename(fileName, ext)
  // PNG and WebP are converted to JPEG by the API
  if (ext === '.png' || ext === '.webp') return `${base}.jpg`
  return path.basename(fileName)
}

export function validateExtension(fileName: string): void {
  const ext = path.extname(fileName).toLowerCase()
  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    throw new ValidationError(
      `Unsupported file type "${ext}". Supported formats: ${[...SUPPORTED_EXTENSIONS].join(', ')}`,
    )
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  if (bytes < 1_024) return `${bytes} B`
  if (bytes < 1_048_576) return `${(bytes / 1_024).toFixed(1)} KB`
  return `${(bytes / 1_048_576).toFixed(2)} MB`
}
