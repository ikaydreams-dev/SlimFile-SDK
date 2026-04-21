import { HttpClient } from './http.js'
import { AuthService } from './auth.js'
import { CompressionService } from './compression.js'
import { StatsService } from './stats.js'
import { AuthenticationError } from './errors.js'
import type {
  SlimFileClientOptions,
  CompressOptions,
  CompressResult,
  BatchCompressOptions,
  BatchCompressResult,
  AuthResult,
  ApiKey,
  Stats,
} from './types.js'

const DEFAULT_BASE_URL = 'https://slimfile-api.onrender.com'
const DEFAULT_TIMEOUT = 120_000

/**
 * The official SlimFile SDK client.
 *
 * @example
 * ```ts
 * import { SlimFileClient } from '@slimfile/sdk'
 *
 * // API key is read from process.env.SLIMFILE_API_KEY automatically
 * const client = new SlimFileClient()
 *
 * const result = await client.compress('./photo.jpg', { quality: 80 })
 * console.log(`Saved ${result.compressionRatio}%`)
 * ```
 */
export class SlimFileClient {
  private readonly http: HttpClient
  private readonly authService: AuthService
  private readonly compressionService: CompressionService
  private readonly statsService: StatsService

  constructor(options: SlimFileClientOptions = {}) {
    const apiKey = options.apiKey ?? process.env['SLIMFILE_API_KEY']
    const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL
    const timeout = options.timeout ?? DEFAULT_TIMEOUT

    this.http = new HttpClient({ baseUrl, timeout })
    if (apiKey) this.http.apiKey = apiKey

    this.authService = new AuthService(this.http)
    this.compressionService = new CompressionService(this.http)
    this.statsService = new StatsService(this.http)
  }

  // ─── Compression ──────────────────────────────────────────────────────────

  /**
   * Compress a single file.
   *
   * @param input - File path (string) or raw file data (Buffer)
   * @param options - Compression options
   */
  compress(input: string | Buffer, options?: CompressOptions): Promise<CompressResult> {
    this.assertApiKey()
    return this.compressionService.compress(input, options)
  }

  /**
   * Compress multiple files in parallel.
   *
   * @param inputs - Array of file paths
   * @param options - Batch compression options
   */
  compressBatch(inputs: string[], options?: BatchCompressOptions): Promise<BatchCompressResult> {
    this.assertApiKey()
    return this.compressionService.compressBatch(inputs, options)
  }

  // ─── Stats ────────────────────────────────────────────────────────────────

  /**
   * Retrieve usage statistics for your account.
   * Requires being logged in — call `login()` or `signup()` first.
   */
  getStats(): Promise<Stats> {
    this.assertToken()
    return this.statsService.getStats()
  }

  // ─── Auth ─────────────────────────────────────────────────────────────────

  /**
   * Log in to an existing SlimFile account.
   * Required before calling createApiKey() if you do not already have a key.
   */
  login(email: string, password: string): Promise<AuthResult> {
    return this.authService.login(email, password)
  }

  /**
   * Create a new SlimFile account.
   * Automatically stores the session token for subsequent calls.
   */
  signup(name: string, email: string, password: string): Promise<AuthResult> {
    return this.authService.signup(name, email, password)
  }

  /**
   * Generate a new API key for the authenticated account.
   * The client is automatically configured with the new key after creation.
   *
   * @param label - A descriptive label for the key (e.g. "my-app")
   */
  async createApiKey(label?: string): Promise<ApiKey> {
    const result = await this.authService.createApiKey(label)
    this.http.apiKey = result.apiKey
    return result
  }

  // ─── Internal ─────────────────────────────────────────────────────────────

  private assertApiKey(): void {
    if (!this.http.apiKey) {
      throw new AuthenticationError()
    }
  }

  private assertToken(): void {
    if (!this.http.token) {
      throw new AuthenticationError('Not logged in. Call login() or signup() before getStats().')
    }
  }
}
