/**
 * Batch example — compress multiple files in parallel.
 *
 * Setup:
 *   1. Get your API key at https://api.slim-file.com
 *   2. Add to your .env file:  SLIMFILE_API_KEY=sf_...
 *   3. Run: npx tsx examples/batch.ts
 */

import { SlimFileClient } from '../src/index.js'

// ⚠️  Never hardcode your API key — always use an environment variable
const client = new SlimFileClient({ apiKey: process.env.SLIMFILE_API_KEY })

const result = await client.compressBatch(
  ['./images/hero.jpg', './images/banner.png', './docs/report.pdf'],
  {
    outputDir: './compressed',
    quality: 75,
    concurrency: 3,
  },
)

console.log(`Compressed ${result.files.length} file(s)`)
console.log(`  Total original:    ${result.totalOriginalSize.toLocaleString()} bytes`)
console.log(`  Total compressed:  ${result.totalCompressedSize.toLocaleString()} bytes`)
console.log(`  Total saved:       ${result.totalSpaceSaved.toLocaleString()} bytes`)
console.log(`  Avg compression:   ${result.avgCompressionRatio}%`)

if (result.failedCount > 0) {
  console.warn(`  ⚠️  ${result.failedCount} file(s) failed to compress`)
}

for (const file of result.files) {
  console.log(`  ✓ ${file.fileName} — ${file.compressionRatio}% smaller`)
}
