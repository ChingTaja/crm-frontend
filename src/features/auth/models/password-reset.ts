import type { Api, ForgotPasswordRequest, ResetPasswordRequest } from '../../../api/Api';
import { unwrapResponse } from '../../../lib/api-operations';

export function createPasswordResetApi(client: Api<unknown>['api']) {
  return {
    requestReset: (signal: AbortSignal, data: ForgotPasswordRequest) =>
      unwrapResponse(client.forgotPassword(data, { signal, format: 'json' })),
    resetPassword: (signal: AbortSignal, data: ResetPasswordRequest) =>
      unwrapResponse(client.resetPassword(data, { signal, format: 'json' })),
  };
}

export function resetToken(search: string) {
  return new URLSearchParams(search).get('token')?.trim() ?? '';
}

export function validateNewPassword(password: string, confirmation: string) {
  if (!password) throw new Error('請輸入新密碼。');
  if (password.length < 8 || password.length > 72) throw new Error('密碼長度須為 8–72 個字元。');
  if (password !== confirmation) throw new Error('兩次輸入的密碼不一致。');
}
