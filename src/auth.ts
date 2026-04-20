import type { HttpClient } from './http.js'
import type { AuthResult, ApiKey } from './types.js'

export class AuthService {
  constructor(private readonly http: HttpClient) {}

  async login(email: string, password: string): Promise<AuthResult> {
    const result = await this.http.post<AuthResult>('/api/auth/signin', { email, password })
    this.http.token = result.token
    return result
  }

  async signup(name: string, email: string, password: string): Promise<AuthResult> {
    const result = await this.http.post<AuthResult>('/api/auth/signup', { name, email, password })
    this.http.token = result.token
    return result
  }

  async createApiKey(label = 'slimfile-sdk'): Promise<ApiKey> {
    return this.http.post<ApiKey>('/api/keys', { name: label })
  }
}
