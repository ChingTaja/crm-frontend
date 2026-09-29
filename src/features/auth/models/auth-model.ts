import type { LoginRequest } from '../../../api/Api';
import { authApi } from './auth-service';

export type LoginCredentials = Pick<LoginRequest, 'password'> & { code: LoginRequest['username'] };

export interface AuthService {
  signIn(credentials: LoginCredentials, signal: AbortSignal): Promise<unknown>;
}

export const authService: AuthService = {
  signIn: ({ code, password }, signal) => authApi.login(signal, { username: code, password }),
};
