import { createGeneratedApi } from '../../../api/client';
import { createProductApi } from './product-api';

export const productApi = createProductApi(createGeneratedApi(import.meta.env.VITE_API_BASE_URL || '/api').api);
