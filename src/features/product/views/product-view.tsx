import { useProductViewModel } from '../view-models/use-product-view-model'
import { ProductEditView } from './product-edit-view'
import { EntityWorkspace } from '@/components/layout/entity-workspace'
import { SalesSidebar } from '@/components/layout/sales-sidebar'
import { EntityList } from '@/components/entity/entity-list'

export function ProductView({ recordId }: { recordId?: string }) {
  const vm = useProductViewModel()
  const record = vm.records.find(item => item.id === recordId)
  return <EntityWorkspace sidebar={<SalesSidebar entity="products" />}>
    {recordId ? recordId === 'new' || record ? <ProductEditView key={recordId} record={record} /> : <p className="py-10">找不到資料。<a className="underline" href="#/products">返回列表</a></p> : <EntityList vm={vm} />}
  </EntityWorkspace>
}
