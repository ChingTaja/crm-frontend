import { useOpportunityViewModel } from '../view-models/use-opportunity-view-model'
import { OpportunityEditView } from './opportunity-edit-view'
import { EntityWorkspace } from '@/components/layout/entity-workspace'
import { SalesSidebar } from '@/components/layout/sales-sidebar'
import { EntityList } from '@/components/entity/entity-list'

export function OpportunityView({ recordId }: { recordId?: string }) {
  const vm = useOpportunityViewModel()
  const record = vm.records.find(item => item.id === recordId)
  return <EntityWorkspace sidebar={<SalesSidebar entity="opportunities" />}>
    {recordId ? recordId === 'new' || record ? <OpportunityEditView key={recordId} record={record} /> : <p className="py-10">找不到資料。<a className="underline" href="#/opportunities">返回列表</a></p> : <EntityList vm={vm} />}
  </EntityWorkspace>
}
