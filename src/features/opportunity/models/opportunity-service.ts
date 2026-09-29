import { createGeneratedApi } from '../../../api/client';
import { createOpportunityApi } from './opportunity-api';

export const opportunityApi = createOpportunityApi(createGeneratedApi(import.meta.env.VITE_API_BASE_URL || '/api').api);
