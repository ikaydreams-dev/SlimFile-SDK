// ─── Client Configuration ─────────────────────────────────────────────────────

export interface SlimFileClientOptions {
  /**
   * Your SlimFile API key.
   * Falls back to process.env.SLIMFILE_API_KEY if not provided.
   * Get one at https://api.slim-file.com
   */
  apiKey?: string

  /**
   * Override the API base URL.
   * @default "https://api.slim-file.com"
   */
  baseUrl?: string

  /**
   * Request timeout in milliseconds.
   * @default 120000
   */
  timeout?: number
}

// ─── Compression ──────────────────────────────────────────────────────────────

export interface CompressOptions {
  /**
   * Compression quality from 1 (maximum compression) to 100 (best quality).
   * @default 80
   */
  quality?: number

  /**
   * Write the compressed file to this path.
   * If omitted, only the buffer is returned via CompressResult.data.
   */
  output?: string

  /**
   * Original file name — required when input is a Buffer.
   * Used to determine the MIME type and output file name.
   */
  fileName?: string
}

export interface CompressResult {
  /** The compressed file as a Node.js Buffer */
  data: Buffer
  /** File name of the compressed output */
  fileName: string
  /** MIME type of the compressed file */
  mimeType: string
  /** Original file size in bytes */
  originalSize: number
  /** Compressed file size in bytes */
  compressedSize: number
  /** Bytes saved by compression */
  spaceSaved: number
  /** Compression ratio as a percentage (0–100) */
  compressionRatio: number
  /** Absolute path the file was written to, if the output option was provided */
  outputPath?: string
}

export interface BatchCompressOptions extends Omit<CompressOptions, 'output' | 'fileName'> {
  /**
   * Directory to write compressed files to.
   * File names are preserved with format conversion applied (e.g. .png → .jpg).
   */
  outputDir?: string

  /**
   * Maximum number of files to compress in parallel.
   * @default 5
   */
  concurrency?: number
}

export interface BatchCompressResult {
  /** Individual result for each successfully compressed file */
  files: CompressResult[]
  /** Total original size of all files in bytes */
  totalOriginalSize: number
  /** Total compressed size of all files in bytes */
  totalCompressedSize: number
  /** Total bytes saved across all files */
  totalSpaceSaved: number
  /** Average compression ratio across all files */
  avgCompressionRatio: number
  /** Number of files that failed to compress */
  failedCount: number
}

// ─── Authentication ───────────────────────────────────────────────────────────

export interface AuthResult {
  /** JWT for use with authenticated endpoints */
  token: string
  user: {
    id: string
    name: string
    email: string
  }
}

export interface ApiKey {
  /** The generated API key — store this securely in your environment variables */
  apiKey: string
  /** Internal key ID */
  id: string
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface Stats {
  apiKeys: number
  requestsToday: number
  filesThisMonth: number
  totalFiles: number
  totalSpaceSaved: number
  avgCompression: number
  singleCompress: number
  batchCompress: number
}
