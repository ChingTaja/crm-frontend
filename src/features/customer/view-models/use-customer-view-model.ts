import { useSyncExternalStore } from 'react'
import { useEntityList } from '@/hooks/use-entity-list'
import type { FilterField } from '@/lib/filter-fields'
import { customerRepository } from '../models/customer-model'
import { uniqueOptions } from '@/lib/filter-fields'

export function useCustomerViewModel() {
  const customers = useSyncExternalStore(customerRepository.subscribe, customerRepository.getSnapshot)
  const ownerOptions = uniqueOptions(customers.map(item => item.owner))
  const fields: FilterField[] = [
        { label: '名稱', type: 'text', hideable: false },
        { label: '產業', type: 'option', options: uniqueOptions(customers.map((item) => item.industry)) },
        { label: '帳戶所有者', type: 'lookup', options: ownerOptions },
        { label: '建立日期', type: 'date' },
        { label: '地址', type: 'text' },
      ]
  const rows = customers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        owner: customer.owner,
        filterValues: [customer.name, customer.industry, customer.owner, customer.createdAt, customer.address],
        cells: [customer.industry, customer.owner, customer.createdAt, customer.address],
      }))
  const list = useEntityList('customers', '客戶', fields, rows, customerRepository.removeMany)
  return { ...list, records: customers }
}
