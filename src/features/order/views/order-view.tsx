import { AppLink } from '@/components/ui/app-link';
import { useOrderViewModel } from '../view-models/use-order-view-model'
import { OrderEditView } from './order-edit-view'
import { EntityWorkspace } from '@/components/layout/entity-workspace'
import { SalesSidebar } from '@/components/layout/sales-sidebar'
import { EntityList } from '@/components/entity/entity-list'
import { QuoteOrderView } from './quote-order-view'

export function OrderView({ recordId }: { recordId?: string }) {
  const vm = useOrderViewModel()
  const record = vm.records.find(item => item.id === recordId)
  return <EntityWorkspace sidebar={<SalesSidebar entity="orders" />}>
    {recordId ? record?.quoteSource ? <QuoteOrderView order={record} /> : recordId === 'new' || record ? <OrderEditView key={recordId} record={record} /> : <p className="py-10">找不到資料。<AppLink className="underline" href="/orders">返回列表</AppLink></p> : <EntityList vm={vm} />}
  </EntityWorkspace>
}
