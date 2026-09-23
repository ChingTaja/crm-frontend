import { createApiClient } from './api-client'

export const api = createApiClient({ baseUrl: import.meta.env.VITE_API_BASE_URL || '/api' })
