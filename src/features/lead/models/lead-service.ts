import { api } from '../../../lib/api'
import { createLeadApi } from './lead-api'

export const leadApi = createLeadApi(api)
