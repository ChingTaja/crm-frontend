export interface PasswordResetService {
  requestReset(email: string, redirectUrl: string, signal: AbortSignal): Promise<void>;
  resetPassword(token: string, password: string, signal: AbortSignal): Promise<void>;
}

// Replace with the generated authentication endpoints once the backend contract is available.
// Never report a sent email or changed password without a successful backend response.
export const passwordResetService: PasswordResetService = {
  async requestReset() {
    throw new Error('目前無法寄送重設密碼信件，請稍後再試。');
  },
  async resetPassword() {
    throw new Error('目前無法修改密碼，請稍後再試。');
  },
};

export function resetToken(search: string) {
  return new URLSearchParams(search).get('token')?.trim() ?? '';
}

export function validateNewPassword(password: string, confirmation: string) {
  if (!password) throw new Error('請輸入新密碼。');
  if (password !== confirmation) throw new Error('兩次輸入的密碼不一致。');
}
