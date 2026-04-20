import type { HttpClient } from './http.js'
import type { Stats } from './types.js'

export class StatsService {
  constructor(private readonly http: HttpClient) {}

  async getStats(): Promise<Stats> {
    return this.http.get<Stats>('/api/keys/stats')
  }
}
