import { ApiError } from '../../../api/api-error';

export function loginErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.details && typeof error.details === 'object') {
    const detail = (error.details as Record<string, unknown>).detail;
    if (typeof detail === 'string' && detail.trim()) return detail;
  }
  return error instanceof Error && error.message.trim() ? error.message : '暫時無法登入，請稍後再試。';
}
