import { createGeneratedApi } from '../../../api/client';
import { createCustomerApi } from './customer-api';

export const customerApi = createCustomerApi(createGeneratedApi(import.meta.env.VITE_API_BASE_URL || '/api').api);
