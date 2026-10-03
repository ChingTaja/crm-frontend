import { createGeneratedApi } from '../../../api/client';
import { createOrderApi } from './order-api';
export const orderApi = createOrderApi(createGeneratedApi(import.meta.env.VITE_API_BASE_URL || '/api').api);
