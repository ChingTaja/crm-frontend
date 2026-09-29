import { authSession } from '../../../api/auth-session';
import type { Api, LoginRequest, RegisterRequest } from '../../../api/Api';
import { unwrapResponse } from '../../../lib/api-operations';

export function createAuthApi(client: Api<unknown>['api']) {
  return {
    async login(signal: AbortSignal, data: LoginRequest) {
      const result = await unwrapResponse(client.login(data, { signal, format: 'json' }));
      signal.throwIfAborted();
      if (!result?.accessToken?.trim()) throw new Error('登入回應缺少驗證 token，請重新登入。');
      if (result.tokenType && result.tokenType.toLowerCase() !== 'bearer') throw new Error('不支援的登入驗證格式。');
      authSession.setToken(result.accessToken);
      return result;
    },
    register: (signal: AbortSignal, data: RegisterRequest) =>
      unwrapResponse(client.register(data, { signal, format: 'json' })),
    currentUser: (signal: AbortSignal) => unwrapResponse(client.currentUser({ signal, format: 'json' })),
    logout: async (signal: AbortSignal) => {
      const token = authSession.getToken();
      await client.logout({ signal });
      if (authSession.getToken() === token) authSession.clear();
    },
  };
}
