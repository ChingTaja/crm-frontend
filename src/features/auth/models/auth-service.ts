import { createGeneratedApi } from '../../../api/client';
import { createAuthApi } from './auth-api';

export const authApi = createAuthApi(createGeneratedApi(import.meta.env.VITE_API_BASE_URL || '/api').api);
