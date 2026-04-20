/**
 * Basic example — compress a single file.
 *
 * Setup:
 *   1. Get your API key at https://api.slim-file.com
 *   2. Add to your .env file:  SLIMFILE_API_KEY=sf_...
 *   3. Run: npx tsx examples/basic.ts
 */

import { SlimFileClient } from '../src/index.js'

// ⚠️  Never hardcode your API key — always use an environment variable
const client = new SlimFileClient({ apiKey: process.env.SLIMFILE_API_KEY })

const result = await client.compress('./photo.jpg', {
  quality: 80,
  output: './photo_compressed.jpg',
})

console.log('Compression complete')
console.log(`  Original:   ${result.originalSize.toLocaleString()} bytes`)
console.log(`  Compressed: ${result.compressedSize.toLocaleString()} bytes`)
console.log(`  Saved:      ${result.spaceSaved.toLocaleString()} bytes (${result.compressionRatio}% reduction)`)
if (result.outputPath) {
  console.log(`  Written to: ${result.outputPath}`)
}
