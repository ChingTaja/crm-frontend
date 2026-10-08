import { createAxiosTransport, type HttpTransport } from './http-transport';
import { authSession } from './auth-session';
import { navigate } from '../lib/router';

const publicPosts = new Set([
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
]);

export function createAuthTransport(baseUrl: string, transport: HttpTransport = createAxiosTransport()): HttpTransport {
  const origin = typeof window === 'undefined' ? 'http://localhost' : window.location.origin;
  const base = new URL(baseUrl || '/', origin);
  const prefix = base.pathname.replace(/\/$/, '');
  return async (input, init) => {
    const request = input instanceof Request ? input : undefined;
    const url = new URL(request?.url ?? String(input), origin);
    const path = url.pathname.slice(prefix.length);
    const isApi = url.origin === base.origin && url.pathname.startsWith(`${prefix}/api/`);
    const method = (init?.method ?? request?.method ?? 'GET').toUpperCase();
    const protectedRequest = isApi && !(method === 'POST' && publicPosts.has(path));
    const token = protectedRequest ? authSession.getToken() : null;
    const headers = new Headers(init?.headers ?? request?.headers);
    if (isApi) {
      headers.delete('Authorization');
      if (token) headers.set('Authorization', `Bearer ${token}`);
    }
    const response = await transport(input, { ...init, headers });
    if (
      protectedRequest &&
      response.status === 401 &&
      !(init?.signal ?? request?.signal)?.aborted &&
      authSession.getToken() === token
    ) {
      authSession.clear();
      if (
        typeof window !== 'undefined' &&
        !['/login', '/forgot-password', '/reset-password'].includes(window.location.pathname)
      ) {
        navigate('/login?sessionExpired=1', { replace: true });
      }
    }
    if (protectedRequest && response.status === 403 && path !== '/api/auth/me' && typeof window !== 'undefined') {
      let detail = '沒有此操作的權限。';
      try {
        const problem = await response.clone().json();
        if (typeof problem.detail === 'string') detail = problem.detail;
      } catch {
        /* Keep the fallback for non-JSON responses. */
      }
      window.dispatchEvent(new CustomEvent('crm:permissions-changed', { detail }));
    }
    return response;
  };
}
