import {
  SlimFileError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  NetworkError,
} from './errors.js'

interface HttpClientConfig {
  baseUrl: string
  timeout: number
}

interface ErrorBody {
  message?: string
  error?: string
}

export class HttpClient {
  private readonly config: HttpClientConfig
  apiKey?: string
  token?: string

  constructor(config: HttpClientConfig) {
    this.config = config
  }

  private buildHeaders(extra?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {}
    if (this.apiKey) headers['x-api-key'] = this.apiKey
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`
    return { ...headers, ...extra }
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    const body = (await response
      .json()
      .catch((): ErrorBody => ({ message: response.statusText }))) as ErrorBody

    const message = body.message ?? body.error ?? response.statusText

    switch (response.status) {
      case 401:
        throw new AuthenticationError(message)
      case 429:
        throw new RateLimitError(message)
      case 400:
        throw new ValidationError(message)
      default:
        throw new SlimFileError(message, response.status)
    }
  }

  async get<T>(path: string): Promise<T> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(`${this.config.baseUrl}${path}`, {
        method: 'GET',
        headers: this.buildHeaders({ 'Content-Type': 'application/json' }),
        signal: controller.signal,
      })

      if (!response.ok) await this.handleErrorResponse(response)
      return response.json() as Promise<T>
    } catch (error) {
      if (error instanceof SlimFileError) throw error
      throw new NetworkError(`Request failed: ${(error as Error).message}`)
    } finally {
      clearTimeout(timer)
    }
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(`${this.config.baseUrl}${path}`, {
        method: 'POST',
        headers: this.buildHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!response.ok) await this.handleErrorResponse(response)
      return response.json() as Promise<T>
    } catch (error) {
      if (error instanceof SlimFileError) throw error
      throw new NetworkError(`Request failed: ${(error as Error).message}`)
    } finally {
      clearTimeout(timer)
    }
  }

  async upload(path: string, formData: FormData): Promise<Buffer> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(`${this.config.baseUrl}${path}`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: formData,
        signal: controller.signal,
      })

      if (!response.ok) await this.handleErrorResponse(response)

      const arrayBuffer = await response.arrayBuffer()
      return Buffer.from(arrayBuffer)
    } catch (error) {
      if (error instanceof SlimFileError) throw error
      throw new NetworkError(`Upload failed: ${(error as Error).message}`)
    } finally {
      clearTimeout(timer)
    }
  }
}
