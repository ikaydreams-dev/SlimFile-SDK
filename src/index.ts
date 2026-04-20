export { SlimFileClient } from './client.js'

export type {
  SlimFileClientOptions,
  CompressOptions,
  CompressResult,
  BatchCompressOptions,
  BatchCompressResult,
  AuthResult,
  ApiKey,
  Stats,
} from './types.js'

export {
  SlimFileError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  NetworkError,
  CompressionError,
} from './errors.js'
