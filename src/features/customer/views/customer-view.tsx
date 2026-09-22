import { Building2 } from 'lucide-react'
import { useCustomerViewModel } from '../view-models/use-customer-view-model'
import { CustomerEditView } from './customer-edit-view'
import { EntityWorkspace } from '@/components/layout/entity-workspace'
import { CustomerSidebar } from '@/components/layout/customer-sidebar'
import { SelectableEntityList } from '@/components/entity/selectable-entity-list'

export function CustomerView({ recordId }: { recordId?: string }) {
  const vm = useCustomerViewModel()
  const record = vm.records.find(item => item.id === recordId)
  return <EntityWorkspace relationship sidebar={<CustomerSidebar isCustomers={true} />}>
    {recordId ? recordId === 'new' || record ? <CustomerEditView key={recordId} customer={record} /> : <div className="py-10"><h1 className="mb-4 text-xl">找不到此客戶</h1><a className="underline" href="#/customers">返回客戶列表</a></div> : <SelectableEntityList vm={vm} icon={Building2} />}
  </EntityWorkspace>
}
