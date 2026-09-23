export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly details?: unknown) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

interface ApiClientOptions {
  baseUrl: string
  headers?: HeadersInit
  credentials?: RequestCredentials
  fetcher?: typeof fetch
}

function errorMessage(details: unknown, status: number): string {
  if (details && typeof details === 'object') {
    const value = details as Record<string, unknown>
    if (typeof value.detail === 'string') return value.detail
    if (typeof value.message === 'string') return value.message
    if (Array.isArray(value.message) && value.message.every(item => typeof item === 'string')) return value.message.join('；')
    if (typeof value.error === 'string') return value.error
    if (typeof value.title === 'string') return value.title
  }
  return `請求失敗（HTTP ${status}）。`
}

export function createApiClient({ baseUrl, headers: defaultHeaders, credentials = 'same-origin', fetcher = fetch }: ApiClientOptions) {
  return async function request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const { body, headers: requestHeaders, ...init } = options
    const headers = new Headers(defaultHeaders)
    new Headers(requestHeaders).forEach((value, key) => headers.set(key, value))
    if (!headers.has('Accept')) headers.set('Accept', 'application/json')
    if (body !== undefined && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
    const url = `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
    const response = await fetcher(url, { credentials, ...init, headers, body: body === undefined ? undefined : JSON.stringify(body) })
    const text = response.status === 204 ? '' : await response.text()
    let data: unknown
    if (text.trim()) {
      try { data = JSON.parse(text) } catch {
        throw new ApiError(response.ok ? 'API 回傳格式不是 JSON。' : errorMessage(undefined, response.status), response.status)
      }
    }
    if (!response.ok) throw new ApiError(errorMessage(data, response.status), response.status, data)
    return data as T
  }
}
