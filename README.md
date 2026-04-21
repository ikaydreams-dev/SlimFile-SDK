# @slimfile/sdk

Official JavaScript/TypeScript SDK for the [SlimFile API](https://api.slim-file.com) — compress images, PDFs, and Office documents programmatically with **up to 95% file size reduction without quality loss**.

> **Node.js only.** This SDK is designed for server-side environments (Node.js ≥18, Bun, Deno with Node compat). It is not compatible with browsers, React Native, or edge runtimes. Never expose your API key in frontend code.

[![npm version](https://img.shields.io/npm/v/@slimfile/sdk)](https://www.npmjs.com/package/@slimfile/sdk)
[![npm downloads](https://img.shields.io/npm/dm/@slimfile/sdk)](https://www.npmjs.com/package/@slimfile/sdk)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Table of Contents

- [Features](#features)
- [Supported Formats](#supported-formats)
- [Requirements](#requirements)
- [Installation](#installation)
- [Getting an API Key](#getting-an-api-key)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [SlimFileClient](#slimfileclient)
  - [compress()](#compress)
  - [compressBatch()](#compressbatch)
  - [getStats()](#getstats)
  - [login()](#login)
  - [signup()](#signup)
  - [createApiKey()](#createapikey)
- [Examples](#examples)
- [TypeScript Support](#typescript-support)
- [Error Handling](#error-handling)
- [Updating](#updating)
- [Links](#links)
- [License](#license)

---

## Features

- Reduce file sizes by **up to 95% without quality loss**
- Compress images, PDFs, PPTX, DOCX, and XLSX files from your Node.js app
- Compress single files or batches in parallel with concurrency control
- Full TypeScript support with strict types and JSDoc on every method
- **Zero runtime dependencies** — uses Node.js 18 built-ins only
- Dual ESM + CJS build — works in any Node.js project
- Returns a `Buffer` so you control where the data goes

---

## Supported Formats

| Format | Extension |
|--------|-----------|
| JPEG | `.jpg`, `.jpeg` |
| PNG | `.png` |
| WebP | `.webp` |
| PDF | `.pdf` |
| PowerPoint | `.pptx` |
| Word | `.docx` |
| Excel | `.xlsx` |

> Note: PNG and WebP files are returned as JPEG after compression. All other formats keep their original extension.

---

## Requirements

- Node.js **18.0.0 or higher** (server-side only — not for browser use)
- A SlimFile API key — [get one here](https://api.slim-file.com)

---

## Installation

```bash
npm install @slimfile/sdk
```

---

## Getting an API Key

> ⚠️ **This SDK is for server-side use only (Node.js).** Never use your API key in frontend or browser code — it will be publicly exposed. Always store it in an environment variable.

1. Create a free account at **[api.slim-file.com/signup](https://api.slim-file.com/signup)**
2. Log in at **[api.slim-file.com/signin](https://api.slim-file.com/signin)**
3. Navigate to **API Keys** in your dashboard
4. Click **Create API Key** and copy it

Then add it to your `.env` file:

```
SLIMFILE_API_KEY=sf_...
```

The SDK automatically reads `SLIMFILE_API_KEY` from your environment — no manual wiring needed.

---

## Quick Start

```ts
import { SlimFileClient } from '@slimfile/sdk'

// API key is read automatically from process.env.SLIMFILE_API_KEY
const client = new SlimFileClient()

const result = await client.compress('./photo.jpg', {
  quality: 80,
  output: './photo_compressed.jpg',
})

console.log(`Saved ${result.compressionRatio}% — ${result.outputPath}`)
```

---

## API Reference

### `SlimFileClient`

The main class. Instantiate it once and reuse it across your application.

```ts
import { SlimFileClient } from '@slimfile/sdk'

const client = new SlimFileClient(options?)
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | `process.env.SLIMFILE_API_KEY` | Your SlimFile API key |
| `baseUrl` | `string` | `https://slimfile-api.onrender.com` | API base URL |
| `timeout` | `number` | `120000` | Request timeout in milliseconds |

---

### `compress()`

Compress a single file. Accepts a file path or a `Buffer`.

```ts
const result = await client.compress(input, options?)
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `input` | `string \| Buffer` | File path or raw file data |
| `options.quality` | `number` | Compression quality 1–100. Default: `80` |
| `options.output` | `string` | Path to write the compressed file to |
| `options.fileName` | `string` | Required when input is a Buffer |

**Returns:** `Promise<CompressResult>`

```ts
{
  data: Buffer            // compressed file data
  fileName: string        // output file name
  mimeType: string        // MIME type
  originalSize: number    // bytes
  compressedSize: number  // bytes
  spaceSaved: number      // bytes
  compressionRatio: number // percentage (0–100)
  outputPath?: string     // written path, if output was set
}
```

**Example:**

```ts
// Compress from file path
const result = await client.compress('./photo.jpg', { quality: 75, output: './out.jpg' })

// Compress from Buffer
const buffer = await fs.readFile('./photo.jpg')
const result = await client.compress(buffer, { fileName: 'photo.jpg' })
```

---

### `compressBatch()`

Compress multiple files in parallel with concurrency control.

```ts
const result = await client.compressBatch(inputs, options?)
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `inputs` | `string[]` | Array of file paths |
| `options.quality` | `number` | Compression quality 1–100. Default: `80` |
| `options.outputDir` | `string` | Directory to write compressed files to |
| `options.concurrency` | `number` | Max parallel requests. Default: `5` |

**Returns:** `Promise<BatchCompressResult>`

```ts
{
  files: CompressResult[]    // result for each successful file
  totalOriginalSize: number
  totalCompressedSize: number
  totalSpaceSaved: number
  avgCompressionRatio: number
  failedCount: number
}
```

**Example:**

```ts
const result = await client.compressBatch(
  ['./hero.jpg', './banner.png', './report.pdf'],
  { outputDir: './compressed', quality: 75 }
)

console.log(`${result.files.length} files compressed, ${result.failedCount} failed`)
```

---

### `getStats()`

Retrieve usage statistics for your account. Requires an active session — call `login()` or `signup()` first.

```ts
await client.login('you@example.com', 'your-password')
const stats = await client.getStats()
```

**Returns:** `Promise<Stats>`

```ts
{
  apiKeys: number
  requestsToday: number
  filesThisMonth: number
  totalFiles: number
  totalSpaceSaved: number
  avgCompression: number
  singleCompress: number
  batchCompress: number
}
```

---

### `login()`

Log in to an existing SlimFile account. Required before calling `createApiKey()` if you do not already have a key.

```ts
const { token, user } = await client.login(email, password)
```

---

### `signup()`

Create a new SlimFile account. Automatically stores the session token.

```ts
const { token, user } = await client.signup(name, email, password)
```

---

### `createApiKey()`

Generate a new API key for the authenticated account. The client auto-configures itself with the new key.

```ts
const { apiKey } = await client.createApiKey(label?)
```

**Example:**

```ts
await client.signup('Jane Dev', 'jane@example.com', 'password')
const { apiKey } = await client.createApiKey('my-app')

// Save to .env: SLIMFILE_API_KEY=<apiKey>
console.log(`SLIMFILE_API_KEY=${apiKey}`)
```

---

## Examples

### Compress a product image for a website

```ts
const result = await client.compress('./hero.png', {
  quality: 75,
  output: './hero_web.jpg',
})
console.log(`${result.originalSize} → ${result.compressedSize} bytes`)
```

### Compress all images in a Next.js public folder

```ts
import { readdirSync } from 'node:fs'
import path from 'node:path'

const dir = './public/images'
const files = readdirSync(dir)
  .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
  .map((f) => path.join(dir, f))

const result = await client.compressBatch(files, {
  outputDir: './public/images/optimized',
  quality: 80,
})

console.log(`Compressed ${result.files.length} images, saved ${result.totalSpaceSaved} bytes`)
```

### Compress an uploaded file in an Express route

```ts
import express from 'express'
import multer from 'multer'
import { SlimFileClient } from '@slimfile/sdk'

const app = express()
const upload = multer({ storage: multer.memoryStorage() })
const client = new SlimFileClient()

app.post('/upload', upload.single('file'), async (req, res) => {
  const result = await client.compress(req.file.buffer, {
    fileName: req.file.originalname,
    quality: 80,
  })

  res.set('Content-Type', result.mimeType)
  res.send(result.data)
})
```

### Generate an API key programmatically

```ts
const client = new SlimFileClient()
await client.login('you@example.com', 'your-password')
const { apiKey } = await client.createApiKey('production')

// Store in your secrets manager or .env file
process.env.SLIMFILE_API_KEY = apiKey
```

---

## TypeScript Support

The SDK is written in TypeScript and ships with full type definitions. Every method, parameter, and return value is typed.

```ts
import type {
  SlimFileClientOptions,
  CompressOptions,
  CompressResult,
  BatchCompressOptions,
  BatchCompressResult,
  Stats,
  ApiKey,
  AuthResult,
} from '@slimfile/sdk'
```

Your editor will provide autocompletion and inline documentation for all options.

---

## Error Handling

All errors extend `SlimFileError` and include a `statusCode` property.

```ts
import {
  SlimFileClient,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  NetworkError,
  CompressionError,
} from '@slimfile/sdk'

try {
  const result = await client.compress('./photo.jpg')
} catch (error) {
  if (error instanceof AuthenticationError) {
    // Missing or invalid API key
    console.error(error.message)
  } else if (error instanceof RateLimitError) {
    // Too many requests — upgrade your plan
    console.error('Rate limit hit')
  } else if (error instanceof ValidationError) {
    // Unsupported file type or bad input
    console.error(error.message)
  } else if (error instanceof NetworkError) {
    // Request failed — check your connection
    console.error('Network error')
  }
}
```

**Error reference:**

| Error | Status | Cause |
|-------|--------|-------|
| `AuthenticationError` | 401 | Missing, invalid, or expired API key |
| `RateLimitError` | 429 | Too many requests — upgrade your plan |
| `ValidationError` | 400 | Unsupported file type or missing required option |
| `NetworkError` | 0 | Request timed out or connection failed |
| `CompressionError` | 422 | The API could not process the file |

**If no API key is configured:**

```
AuthenticationError: No API key found.
Set SLIMFILE_API_KEY in your environment or pass it via new SlimFileClient({ apiKey: "..." }).
Get your free API key at https://api.slim-file.com
```

---

## Updating

```bash
npm update @slimfile/sdk
```

---

## Links

- Website: [api.slim-file.com](https://api.slim-file.com)
- npm: [npmjs.com/package/@slimfile/sdk](https://www.npmjs.com/package/@slimfile/sdk)
- Issues: [github.com/ikaydreams-dev/slimfile-sdk/issues](https://github.com/ikaydreams-dev/slimfile-sdk/issues)

---

## License

MIT
