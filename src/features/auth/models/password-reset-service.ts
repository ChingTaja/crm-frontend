import { createGeneratedApi } from '../../../api/client';
import { createPasswordResetApi } from './password-reset';

export const passwordResetApi = createPasswordResetApi(
  createGeneratedApi(import.meta.env.VITE_API_BASE_URL || '/api').api
);
