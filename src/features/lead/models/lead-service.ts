import { createGeneratedApi } from '../../../api/client';
import { createLeadApi } from './lead-api';

export const leadApi = createLeadApi(createGeneratedApi(import.meta.env.VITE_API_BASE_URL || '/api').api);
