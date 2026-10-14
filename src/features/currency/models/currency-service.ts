import { createGeneratedApi } from '../../../api/client';
import { createCurrencyApi } from './currency-api';

export const currencyApi = createCurrencyApi(createGeneratedApi(import.meta.env.VITE_API_BASE_URL || '/api'));
