import { createAuthFetch } from '../api/auth-fetch';
import { createApiClient } from './api-client';

const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
export const api = createApiClient({
  baseUrl,
  fetcher: createAuthFetch(baseUrl.replace(/\/$/, '').replace(/\/api$/, '')),
});
