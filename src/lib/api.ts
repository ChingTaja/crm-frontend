import { createAuthTransport } from '../api/auth-transport';
import { createApiClient } from './api-client';

const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
export const api = createApiClient({
  baseUrl,
  transport: createAuthTransport(baseUrl.replace(/\/$/, '').replace(/\/api$/, '')),
});
