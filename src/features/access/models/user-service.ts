import { createGeneratedApi } from '../../../api/client';
import { createUserApi } from './user-api';

export const userApi = createUserApi(createGeneratedApi(import.meta.env.VITE_API_BASE_URL || '/api').api);
