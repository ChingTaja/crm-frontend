import { createGeneratedApi } from '../../../api/client';
import { createContactApi } from './contact-api';

export const contactApi = createContactApi(createGeneratedApi(import.meta.env.VITE_API_BASE_URL || '/api').api);
