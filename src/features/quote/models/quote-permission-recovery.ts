import { ApiError } from '../../../api/api-error';

// Refresh reads only; the original failed write and its ProblemDetail remain visible.
export async function refreshAfterForbidden(error: unknown, refresh: () => Promise<unknown>, revoke?: () => void) {
  if (!(error instanceof ApiError) || error.status !== 403) return false;
  revoke?.();
  try { await refresh(); } catch { /* Keep readable content, with actions revoked if refresh fails. */ }
  return true;
}
