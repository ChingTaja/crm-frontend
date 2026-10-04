import { createGeneratedApi } from '../../../api/client';
import { createRoleApi } from './role-api';
export const roleApi = createRoleApi(createGeneratedApi(import.meta.env.VITE_API_BASE_URL || '/api').api);
