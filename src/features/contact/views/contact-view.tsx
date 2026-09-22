import { UserRound } from 'lucide-react'
import { useContactViewModel } from '../view-models/use-contact-view-model'
import { ContactEditView } from './contact-edit-view'
import { EntityWorkspace } from '@/components/layout/entity-workspace'
import { CustomerSidebar } from '@/components/layout/customer-sidebar'
import { SelectableEntityList } from '@/components/entity/selectable-entity-list'

export function ContactView({ recordId }: { recordId?: string }) {
  const vm = useContactViewModel()
  const record = vm.records.find(item => item.id === recordId)
  return <EntityWorkspace relationship sidebar={<CustomerSidebar isCustomers={false} />}>
    {recordId ? recordId === 'new' || record ? <ContactEditView key={recordId} contact={record} /> : <div className="py-10"><h1 className="mb-4 text-xl">找不到此聯絡人</h1><a className="underline" href="#/contacts">返回聯絡人列表</a></div> : <SelectableEntityList vm={vm} icon={UserRound} />}
  </EntityWorkspace>
}
