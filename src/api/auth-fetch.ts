import { authSession } from './auth-session';
import { navigate } from '../lib/router';

const publicPosts = new Set([
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
]);

export function createAuthFetch(baseUrl: string, fetcher: typeof fetch = fetch): typeof fetch {
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
    const response = await fetcher(input, { ...init, headers });
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
    return response;
  };
}
