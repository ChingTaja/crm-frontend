import { createAuthTransport } from './auth-transport';
import { Api } from './Api';
import type { HttpTransport } from './http-transport';
import { ApiError } from './api-error';

// Generated endpoints already include /api; preserve the existing API base URL setting.
export function createGeneratedApi(baseUrl = '/api', transport?: HttpTransport) {
  const root = baseUrl.replace(/\/$/, '').replace(/\/api$/, '');
  const authenticatedRequest = createAuthTransport(root, transport);
  return new Api({
    baseUrl: root,
    baseApiParams: { credentials: 'include', headers: { Accept: 'application/json' } },
    customRequest: async (...args) => {
      const response = await authenticatedRequest(...args);
      if (!response.ok) {
        let details: unknown;
        try {
          details = await response.clone().json();
        } catch {
          /* Use HTTP fallback for non-JSON errors. */
        }
        const error = details && typeof details === 'object' ? (details as Record<string, unknown>) : {};
        const message = [error.detail, error.message, error.error, error.title].find(
          (value) => typeof value === 'string'
        );
        throw new ApiError(
          typeof message === 'string' ? message : `請求失敗（HTTP ${response.status}）。`,
          response.status,
          details
        );
      }
      return response;
    },
  });
}
