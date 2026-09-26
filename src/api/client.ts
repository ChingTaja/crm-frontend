import { Api, type ApiConfig } from './Api'
import { ApiError } from '../lib/api-client'

// Generated endpoints already include /api; preserve the existing API base URL setting.
export function createGeneratedApi(baseUrl = '/api', customFetch?: ApiConfig<unknown>['customFetch']) {
  return new Api({
    baseUrl: baseUrl.replace(/\/$/, '').replace(/\/api$/, ''),
    baseApiParams: { headers: { Accept: 'application/json' } },
    customFetch: async (...args) => {
      const response = await (customFetch ?? fetch)(...args)
      if (!response.ok) {
        let details: unknown
        try { details = await response.clone().json() } catch { /* Use HTTP fallback for non-JSON errors. */ }
        const error = details && typeof details === 'object' ? details as Record<string, unknown> : {}
        const message = [error.detail, error.message, error.error, error.title].find(value => typeof value === 'string')
        throw new ApiError(typeof message === 'string' ? message : `請求失敗（HTTP ${response.status}）。`, response.status, details)
      }
      return response
    },
  })
}
