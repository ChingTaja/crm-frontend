import { uniqueOptions, type FilterField } from '@/lib/filter-fields'
import { useFieldOrder } from '@/hooks/use-field-order'
import type { FieldFilter } from '@/components/ui/filter-menu';
import { createFilterGroup, matchesAdvancedFilter, type FilterGroup } from '@/features/filters/models/advanced-filter';
import { useState, useSyncExternalStore } from 'react';
import { customerRepository, contactRepository, type CustomerEntity } from '../models/customer-model';

export function useCustomerViewModel(entity: CustomerEntity, recordId?: string) {
  const fieldOrder = useFieldOrder(5)
  const customers = useSyncExternalStore(customerRepository.subscribe, customerRepository.getSnapshot);
  const contacts = useSyncExternalStore(contactRepository.subscribe, contactRepository.getSnapshot);
  const editingContact = contacts.find((contact) => contact.id === recordId);
  const editingCustomer = customers.find((customer) => customer.id === recordId);
  const [hiddenFields, setHiddenFields] = useState<number[]>([]);
  const [advancedFilter, setAdvancedFilter] = useState(createFilterGroup);
  const [query, updateQuery] = useState('');
  const [requestedPage, setPage] = useState(1);
  const [pageSize, updatePageSize] = useState(5);
  const pageSizeOptions = [5, 10, 15, 20];
  const setPageSize = (value: number) => {
    if (!pageSizeOptions.includes(value)) return;
    updatePageSize(value);
    setPage(1);
  };
  const setQuery = (value: string) => {
    updateQuery(value);
    setPage(1);
  };
  const [sortAscending, setSortAscending] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<FieldFilter | null>(null);
  const isCustomers = entity === 'customers';
  const ownerOptions = uniqueOptions(customers.map(item => item.owner))
  const fields: FilterField[] = isCustomers ? [
    { label: '名稱', type: 'text', hideable: false },
    { label: '產業', type: 'option', options: uniqueOptions(customers.map(item => item.industry)) },
    { label: '帳戶所有者', type: 'lookup', options: ownerOptions },
    { label: '建立日期', type: 'date' },
    { label: '地址', type: 'text' },
  ] : [
    { label: '名稱', type: 'text', hideable: false },
    { label: '所屬客戶', type: 'lookup', options: customers.map(item => ({ value: item.id, label: item.name })) },
    { label: '職稱', type: 'text' },
    { label: '電子郵件', type: 'email' },
    { label: '電話', type: 'phone' },
  ]
  const rows = isCustomers
    ? customers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        owner: customer.owner,
        filterValues: [customer.name, customer.industry, customer.owner, customer.createdAt, customer.address],
        cells: [customer.industry, customer.owner, customer.createdAt, customer.address],
      }))
    : contacts.map((contact) => {
        const customer = customers.find((item) => item.id === contact.customerId);
        return {
          id: contact.id,
          name: contact.name,
          owner: customer?.owner ?? '',
          filterValues: [contact.name, contact.customerId, contact.title, contact.email, contact.phone],
          cells: [customer?.name ?? '—', contact.title, contact.email, contact.phone],
        };
      });
  const visibleRows = rows.filter(
    (row) =>
      matchesAdvancedFilter(row.filterValues, advancedFilter) &&
      (!filter || matchesAdvancedFilter(row.filterValues, { ...filter, kind: 'rule', id: 'simple' })) &&
      [row.name, ...row.cells].join(' ').toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
  );
  if (sortAscending) visibleRows.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'));
  const pageCount = Math.max(1, Math.ceil(visibleRows.length / pageSize));
  const page = Math.min(requestedPage, pageCount);
  const pageRows = visibleRows.slice((page - 1) * pageSize, page * pageSize);
  const allSelected = pageRows.length > 0 && pageRows.every((row) => selectedIds.includes(row.id));

  return {
    fields,
    ...fieldOrder,
    advancedFilter,
    applyAdvancedFilter: (value: FilterGroup) => {
      setAdvancedFilter(value);
      setPage(1);
    },
    isNew: recordId === 'new',
    startCreate: () => {
      setAdvancedFilter(createFilterGroup());
      updateQuery('');
      setFilter(null);
      setSortAscending(false);
      setPage(1);
      window.location.hash = `/${entity}/new`;
    },
    editingCustomer,
    editingContact,
    isEditing: recordId !== undefined,
    isCustomers,
    rows: pageRows,
    total: rows.length,
    filteredTotal: visibleRows.length,
    pageSize,
    pageSizeOptions,
    setPageSize,
    page,
    pageCount,
    setPage: (value: number) => setPage(Math.max(1, Math.min(value, pageCount))),
    columns: isCustomers ? ['產業', '帳戶所有者', '建立日期', '地址'] : ['所屬客戶', '職稱', '電子郵件', '電話'],
    hiddenFields,
    toggleFieldVisibility: (field: number) =>
      setHiddenFields((current) =>
        field === 0 ? current : current.includes(field) ? current.filter((item) => item !== field) : [...current, field]
      ),
    query,
    setQuery,
    filter,
    applyFilter: (value: FieldFilter | null) => {
      setFilter(value);
      setPage(1);
    },
    clearFilter: () => {
      setFilter(null);
      setPage(1);
    },
    sortAscending,
    toggleSort: () => {
      setSortAscending((value) => !value);
      setPage(1);
    },
    selectedIds,
    allSelected,
    toggleSelection: (id: string) =>
      setSelectedIds((ids) => (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id])),
    toggleAll: () =>
      setSelectedIds((ids) =>
        allSelected
          ? ids.filter((id) => !pageRows.some((row) => row.id === id))
          : [...new Set([...ids, ...pageRows.map((row) => row.id)])]
      ),
    openDetails: (id: string) => {
      window.location.hash = `/${entity}/${id}/edit`;
    },
  };
}

export type CustomerViewModel = ReturnType<typeof useCustomerViewModel>;
