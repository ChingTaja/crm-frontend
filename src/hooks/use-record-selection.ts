import { useState } from 'react'

interface SelectableRecord { id: string; name: string }

export function useRecordSelection(records: SelectableRecord[], pageRecords: { id: string }[], removeMany: (ids: string[]) => void | Promise<void>) {
  const [requestedIds, setRequestedIds] = useState<string[]>([])
  const selectedRecords = records.filter(record => requestedIds.includes(record.id))
  const selectedIds = selectedRecords.map(record => record.id)
  const allSelected = pageRecords.length > 0 && pageRecords.every(record => selectedIds.includes(record.id))
  const partiallySelected = !allSelected && pageRecords.some(record => selectedIds.includes(record.id))

  return {
    selectedRecords, selectedIds, allSelected, partiallySelected,
    clearSelection: () => setRequestedIds([]),
    toggleSelection: (id: string) => setRequestedIds(ids => ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id]),
    toggleAll: () => setRequestedIds(ids => allSelected
      ? ids.filter(id => !pageRecords.some(record => record.id === id))
      : [...new Set([...ids, ...pageRecords.map(record => record.id)])]),
    deleteSelected: async () => {
      if (!selectedIds.length) return
      await removeMany(selectedIds)
      setRequestedIds(ids => ids.filter(id => !selectedIds.includes(id)))
    },
  }
}
