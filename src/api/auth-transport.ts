import { createAxiosTransport, type HttpTransport } from './http-transport';
import { createRefreshCoordinator, problemCode, waitForAuth } from './auth-refresh';
import { ApiError } from './api-error';
import { authSession } from './auth-session';
import { navigate } from '../lib/router';

const publicPosts = new Set(['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password', '/api/auth/reset-password', '/api/auth/refresh', '/api/auth/logout']);
const cookiePosts = new Set(['/api/auth/login', '/api/auth/refresh', '/api/auth/logout']);
function expireSession(generation: number) {
  if (authSession.getGeneration() !== generation) return;
  authSession.clear();
  if (typeof window !== 'undefined' && !['/login', '/forgot-password', '/reset-password'].includes(window.location.pathname)) navigate('/login?sessionExpired=1', { replace: true });
}
export function createAuthTransport(baseUrl: string, transport: HttpTransport = createAxiosTransport()): HttpTransport {
  const origin = typeof window === 'undefined' ? 'http://localhost' : window.location.origin;
  const base = new URL(baseUrl || '/', origin);
  const prefix = base.pathname.replace(/\/$/, '');
  const coordinator = createRefreshCoordinator(baseUrl, base.href, transport);
  return async (input, init = {}) => {
    const request = input instanceof Request ? input : undefined;
    const url = new URL(request?.url ?? String(input), origin);
    const path = url.pathname.slice(prefix.length);
    const isApi = url.origin === base.origin && url.pathname.startsWith(`${prefix}/api/`);
    const method = (init.method ?? request?.method ?? 'GET').toUpperCase();
    const signal = init.signal ?? request?.signal;
    signal?.throwIfAborted();
    const protectedRequest = isApi && path !== '/api/auth/csrf' && !(method === 'POST' && publicPosts.has(path));
    const headers = new Headers(init.headers ?? request?.headers);
    if (isApi) headers.delete('Authorization');
    if (isApi && method === 'POST' && cookiePosts.has(path)) {
      if (path !== '/api/auth/refresh') authSession.invalidatePending();
      const generation = authSession.getGeneration();
      if (path === '/api/auth/refresh') {
        try {
          return Response.json(await waitForAuth(coordinator.refresh(), signal));
        } catch (error) { if (error instanceof ApiError && error.status === 401 && !signal?.aborted) expireSession(generation); throw error; }
      }
      const response = await coordinator.withCookieLock(() => coordinator.cookieRequest(input, { ...init, method, signal, headers }));
      if (path === '/api/auth/logout' && response.ok) expireSessionWithoutRedirect(generation);
      return response;
    }
    const generation = authSession.getGeneration();
    async function renew() {
      try { await waitForAuth(coordinator.refresh(), signal); }
      catch (error) { if (error instanceof ApiError && error.status === 401 && !signal?.aborted) expireSession(generation); throw error; }
    }
    // AccessProvider loads /me before any business UI mounts: restore the cookie session first.
    if (protectedRequest && path === '/api/auth/me' && !authSession.getToken()) await renew();
    const token = protectedRequest ? authSession.getToken() : null;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const retrySource = request?.clone();
    let response = await transport(input, { ...init, signal, headers });
    if (protectedRequest && response.status === 401 && !signal?.aborted) {
      if (authSession.getGeneration() !== generation) throw new DOMException('登入狀態已變更。', 'AbortError');
      if (await problemCode(response) === 'ACCESS_TOKEN_EXPIRED') {
        if (authSession.getToken() === token) await renew();
        signal?.throwIfAborted();
        if (authSession.getGeneration() !== generation) throw new DOMException('登入狀態已變更。', 'AbortError');
        headers.set('Authorization', `Bearer ${authSession.getToken()}`);
        response = await transport(retrySource ?? input, { ...init, signal, headers });
      }
      if (response.status === 401 && !signal?.aborted) expireSession(generation);
    }
    if (protectedRequest && response.status === 403 && path !== '/api/auth/me' && typeof window !== 'undefined') {
      const details = await response.clone().json().catch(() => undefined);
      window.dispatchEvent(new CustomEvent('crm:permissions-changed', { detail: typeof details?.detail === 'string' ? details.detail : '沒有此操作的權限。' }));
    }
    return response;
  };
}
function expireSessionWithoutRedirect(generation: number) {
  if (authSession.getGeneration() === generation) authSession.clear();
}
