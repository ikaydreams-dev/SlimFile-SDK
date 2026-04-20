import fs from 'node:fs/promises'
import path from 'node:path'
import type { HttpClient } from './http.js'
import type {
  CompressOptions,
  CompressResult,
  BatchCompressOptions,
  BatchCompressResult,
} from './types.js'
import { ValidationError } from './errors.js'
import { getMimeType, resolveOutputFileName, validateExtension } from './utils.js'

export class CompressionService {
  constructor(private readonly http: HttpClient) {}

  async compress(input: string | Buffer, options: CompressOptions = {}): Promise<CompressResult> {
    let fileBuffer: Buffer
    let fileName: string

    if (typeof input === 'string') {
      fileName = path.basename(input)
      validateExtension(fileName)
      fileBuffer = await fs.readFile(input)
    } else {
      if (!options.fileName) {
        throw new ValidationError(
          'The fileName option is required when input is a Buffer (e.g. { fileName: "photo.jpg" })',
        )
      }
      fileName = options.fileName
      validateExtension(fileName)
      fileBuffer = input
    }

    const originalSize = fileBuffer.byteLength
    const mimeType = getMimeType(fileName)

    const form = new FormData()
    form.append('file', new File([fileBuffer], fileName, { type: mimeType }))
    if (options.quality !== undefined) {
      form.append('quality', String(options.quality))
    }

    const compressedBuffer = await this.http.upload('/api/compress', form)
    const compressedSize = compressedBuffer.byteLength
    const spaceSaved = originalSize - compressedSize
    const compressionRatio =
      originalSize > 0 ? Number(((spaceSaved / originalSize) * 100).toFixed(1)) : 0

    const outputFileName = resolveOutputFileName(fileName)
    const outputMimeType = getMimeType(outputFileName)

    let outputPath: string | undefined
    if (options.output) {
      outputPath = path.resolve(options.output)
      await fs.mkdir(path.dirname(outputPath), { recursive: true })
      await fs.writeFile(outputPath, compressedBuffer)
    }

    return {
      data: compressedBuffer,
      fileName: outputFileName,
      mimeType: outputMimeType,
      originalSize,
      compressedSize,
      spaceSaved,
      compressionRatio,
      outputPath,
    }
  }

  async compressBatch(
    inputs: string[],
    options: BatchCompressOptions = {},
  ): Promise<BatchCompressResult> {
    const concurrency = options.concurrency ?? 5
    const results: CompressResult[] = []
    let failedCount = 0

    for (let i = 0; i < inputs.length; i += concurrency) {
      const chunk = inputs.slice(i, i + concurrency)
      const settled = await Promise.allSettled(
        chunk.map((input) => {
          const outputPath = options.outputDir
            ? path.join(options.outputDir, resolveOutputFileName(path.basename(input)))
            : undefined
          return this.compress(input, { quality: options.quality, output: outputPath })
        }),
      )

      for (const result of settled) {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          failedCount++
        }
      }
    }

    const totalOriginalSize = results.reduce((sum, r) => sum + r.originalSize, 0)
    const totalCompressedSize = results.reduce((sum, r) => sum + r.compressedSize, 0)
    const totalSpaceSaved = totalOriginalSize - totalCompressedSize
    const avgCompressionRatio =
      results.length > 0
        ? Number(
            (results.reduce((sum, r) => sum + r.compressionRatio, 0) / results.length).toFixed(1),
          )
        : 0

    return {
      files: results,
      totalOriginalSize,
      totalCompressedSize,
      totalSpaceSaved,
      avgCompressionRatio,
      failedCount,
    }
  }
}
