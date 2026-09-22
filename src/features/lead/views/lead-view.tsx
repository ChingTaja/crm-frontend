import { useLeadViewModel } from '../view-models/use-lead-view-model'
import { LeadEditView } from './lead-edit-view'
import { EntityWorkspace } from '@/components/layout/entity-workspace'
import { SalesSidebar } from '@/components/layout/sales-sidebar'
import { EntityList } from '@/components/entity/entity-list'

export function LeadView({ recordId }: { recordId?: string }) {
  const vm = useLeadViewModel()
  const record = vm.records.find(item => item.id === recordId)
  return <EntityWorkspace sidebar={<SalesSidebar entity="leads" />}>
    {recordId ? recordId === 'new' || record ? <LeadEditView key={`${recordId}-${record?.qualification?.reviewedAt ?? ''}`} record={record} /> : <p className="py-10">找不到資料。<a className="underline" href="#/leads">返回列表</a></p> : <EntityList vm={vm} />}
  </EntityWorkspace>
}
