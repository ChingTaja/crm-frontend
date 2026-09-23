import { useEntityForm } from '@/hooks/use-entity-form'
import { cacheLead, type Lead } from '../models/lead-model'
import { useApi } from '@/hooks/use-api'
import { leadApi } from '../models/lead-service'

export function useLeadEditViewModel(record?: Lead) {
  const initial: Lead = { id: '', name: '', company: '', email: '', phone: '', source: '', owner: '', status: '待聯繫', ...record }
  const request = useApi(leadApi.save)
  return useEntityForm('leads', initial, async draft => {
    const saved = await request.execute({ ...draft, email: draft.email.trim(),
      qualification: record?.qualification, status: record?.qualification ? record.status : draft.status })
    cacheLead(saved)
  })
}
