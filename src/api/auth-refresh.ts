import type { CsrfResponse, RefreshResponse } from './Api';
import { ApiError } from './api-error';
import { authSession } from './auth-session';
import type { HttpTransport } from './http-transport';

interface RefreshState {
  csrf?: CsrfResponse;
  csrfPending?: Promise<CsrfResponse>;
  refreshPending?: Promise<RefreshResponse>;
}
const states = new Map<string, RefreshState>();
export async function problemCode(response: Response): Promise<string | undefined> {
  try { const data = await response.clone().json(); return typeof data.code === 'string' ? data.code : undefined; } catch { return undefined; }
}
async function json<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => undefined);
  if (!response.ok) throw new ApiError(data?.detail ?? `請求失敗（HTTP ${response.status}）。`, response.status, data);
  if (!data) throw new Error('無法完成登入驗證，請稍後再試。');
  return data;
}
export function waitForAuth<T>(pending: Promise<T>, signal?: AbortSignal | null): Promise<T> {
  if (!signal) return pending;
  if (signal.aborted) return Promise.reject(signal.reason ?? new DOMException('請求已取消。', 'AbortError'));
  return new Promise((resolve, reject) => {
    const abort = () => { cleanup(); reject(signal.reason ?? new DOMException('請求已取消。', 'AbortError')); };
    const cleanup = () => signal.removeEventListener('abort', abort);
    signal.addEventListener('abort', abort, { once: true });
    pending.then(value => { cleanup(); resolve(value); }, error => { cleanup(); reject(error); });
  });
}
export function createRefreshCoordinator(root: string, scope: string, transport: HttpTransport) {
  const state = states.get(scope) ?? {};
  states.set(scope, state);
  async function csrf(): Promise<CsrfResponse> {
    if (state.csrf) return state.csrf;
    if (!state.csrfPending) {
      state.csrfPending = (async () => {
        const result = await json<CsrfResponse>(await transport(`${root}/api/auth/csrf`, { method: 'GET', credentials: 'include', cache: 'no-store', headers: { Accept: 'application/json' } }));
        if (!result.token?.trim() || result.headerName !== 'X-CSRF-TOKEN') throw new Error('無法完成安全驗證，請重新載入。');
        state.csrf = result;
        return result;
      })().finally(() => { state.csrfPending = undefined; });
    }
    return state.csrfPending;
  }
  async function cookieRequest(input: string | URL | Request, init: RequestInit = {}): Promise<Response> {
    const retrySource = input instanceof Request ? input.clone() : input;
    for (let attempt = 0; attempt < 2; attempt++) {
      const token = await waitForAuth(csrf(), init.signal);
      init.signal?.throwIfAborted();
      const headers = new Headers(init.headers);
      headers.delete('Authorization');
      headers.set(token.headerName, token.token);
      const response = await transport(attempt === 0 ? input : retrySource, { ...init, credentials: 'include', headers });
      if (attempt === 0 && response.status === 403 && await problemCode(response) === 'CSRF_INVALID') { state.csrf = undefined; continue; }
      return response;
    }
    throw new Error('CSRF 驗證失敗。');
  }
  async function withCookieLock<T>(action: () => Promise<T>): Promise<T> {
    if (typeof navigator !== 'undefined' && navigator.locks) return navigator.locks.request(`crm-cookie-auth:${scope}`, action);
    return action();
  }
  function refresh(): Promise<RefreshResponse> {
    if (!state.refreshPending) {
      const expectedGeneration = authSession.getGeneration();
      state.refreshPending = withCookieLock(async () => {
        if (authSession.getGeneration() !== expectedGeneration) throw new DOMException('登入狀態已變更。', 'AbortError');
        const result = await json<RefreshResponse>(await cookieRequest(`${root}/api/auth/refresh`, { method: 'POST', headers: { Accept: 'application/json' } }));
        if (!result.accessToken?.trim() || result.tokenType?.toLowerCase() !== 'bearer' || !Number.isFinite(result.expiresIn) || result.expiresIn <= 0) throw new Error('無法延續登入狀態，請稍後再試。');
        if (!authSession.updateFromRefresh(result.accessToken, result.expiresIn, expectedGeneration)) throw new DOMException('登入狀態已變更。', 'AbortError');
        return result;
      }).finally(() => { state.refreshPending = undefined; });
    }
    return state.refreshPending;
  }
  return { refresh, cookieRequest, withCookieLock };
}
