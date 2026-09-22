import { useSyncExternalStore } from 'react'
import { useEntityList } from '@/hooks/use-entity-list'
import type { FilterField } from '@/lib/filter-fields'
import { contactRepository } from '../models/contact-model'
import { customerRepository } from '@/features/customer/models/customer-model'

export function useContactViewModel() {
  const customers = useSyncExternalStore(customerRepository.subscribe, customerRepository.getSnapshot)
  const contacts = useSyncExternalStore(contactRepository.subscribe, contactRepository.getSnapshot)
  const fields: FilterField[] = [
        { label: '名稱', type: 'text', hideable: false },
        { label: '所屬客戶', type: 'lookup', options: customers.map((item) => ({ value: item.id, label: item.name })) },
        { label: '職稱', type: 'text' },
        { label: '電子郵件', type: 'email' },
        { label: '電話', type: 'phone' },
      ]
  const rows = contacts.map((contact) => {
        const customer = customers.find((item) => item.id === contact.customerId);
        return {
          id: contact.id,
          name: contact.name,
          owner: customer?.owner ?? '',
          filterValues: [contact.name, contact.customerId, contact.title, contact.email, contact.phone],
          cells: [customer?.name ?? '—', contact.title, contact.email, contact.phone],
        };
      })
  const list = useEntityList('contacts', '聯絡人', fields, rows, contactRepository.removeMany)
  return { ...list, records: contacts }
}
