import { requestFieldErrors, type FieldErrors } from '../../../lib/form-validation';

export function userFormErrors(error: unknown): FieldErrors {
  const errors = requestFieldErrors(error);
  if (!error || typeof error !== 'object' || !('details' in error)) return errors;
  const details = error.details;
  if (!details || typeof details !== 'object') return errors;
  const problem = details as Record<string, unknown>;
  const field = problem.code === 'USERNAME_ALREADY_REGISTERED' ? 'username'
    : problem.code === 'EMAIL_ALREADY_REGISTERED' ? 'email' : undefined;
  if (!field || errors[field]) return errors;
  const message = typeof problem.detail === 'string' && problem.detail.trim() ? problem.detail
    : field === 'username' ? '帳號已被註冊。' : 'Email 已被註冊。';
  return { ...errors, [field]: message };
}
