import { useEntityForm } from '@/hooks/use-entity-form'
import { leadRepository, type Lead } from '../models/lead-model'

export function useLeadEditViewModel(record?: Lead) {
  const initial: Lead = { id: '', name: '', company: '', email: '', phone: '', source: '', owner: '', status: '待聯繫', ...record }
  return useEntityForm('leads', initial, draft => {
    const current = leadRepository.getSnapshot().find(item => item.id === draft.id)
    leadRepository.save({ ...draft, email: draft.email.trim(), qualification: current?.qualification, status: current?.qualification ? current.status : draft.status })
  })
}
