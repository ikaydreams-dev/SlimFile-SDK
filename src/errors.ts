export class SlimFileError extends Error {
  readonly statusCode: number

  constructor(message: string, statusCode = 500) {
    super(message)
    this.name = 'SlimFileError'
    this.statusCode = statusCode
    Error.captureStackTrace(this, this.constructor)
  }
}

export class AuthenticationError extends SlimFileError {
  constructor(
    message = [
      'No API key found.',
      'Set SLIMFILE_API_KEY in your environment or pass it via new SlimFileClient({ apiKey: "..." }).',
      'Get your free API key at https://api.slim-file.com',
    ].join('\n'),
  ) {
    super(message, 401)
    this.name = 'AuthenticationError'
  }
}

export class RateLimitError extends SlimFileError {
  constructor(message = 'Rate limit exceeded. Upgrade your plan at https://api.slim-file.com') {
    super(message, 429)
    this.name = 'RateLimitError'
  }
}

export class ValidationError extends SlimFileError {
  constructor(message: string) {
    super(message, 400)
    this.name = 'ValidationError'
  }
}

export class NetworkError extends SlimFileError {
  constructor(message: string) {
    super(message, 0)
    this.name = 'NetworkError'
  }
}

export class CompressionError extends SlimFileError {
  constructor(message: string) {
    super(message, 422)
    this.name = 'CompressionError'
  }
}
