import { useEffect } from 'react';
import { useApi } from '@/hooks/use-api';
import { useEntityList } from '@/hooks/use-entity-list';
import type { FilterField } from '@/lib/filter-fields';
import { deletionSummary } from '@/lib/api-operations';
import { currencyApi } from '../models/currency-service';

const fields: FilterField[] = [
  { label: '名稱', apiFieldName: 'name', type: 'text', hideable: false },
  { label: '幣別代碼', type: 'text' },
  { label: '符號', type: 'text' },
  { label: '小數位數', type: 'number' },
  { label: '狀態', type: 'option', options: [{ value: 'true', label: '啟用' }, { value: 'false', label: '停用' }] },
];

export function useCurrencyViewModel() {
  const { execute, cancel, ...request } = useApi(currencyApi.list);
  const deletion = useApi(currencyApi.removeMany);
  useEffect(() => {
    void execute().catch(() => {});
    return cancel;
  }, [execute, cancel]);
  const records = request.data ?? [];
  const rows = records.map(record => ({
    id: record.code, name: record.name,
    cells: [record.code, record.symbol, String(record.fractionDigits), record.active ? '啟用' : '停用'],
    filterValues: [record.name, record.code, record.symbol, String(record.fractionDigits), String(record.active)],
  }));
  const list = useEntityList('currencies', '幣別', fields, rows, async ids => {
    const result = await deletion.execute(ids);
    const summary = deletionSummary(result, rows);
    await execute().catch(() => {});
    if (result.failed.length) throw new Error(summary);
    return summary;
  });
  return { ...list, request: { ...request, reload: () => { void execute().catch(() => {}); } } };
}
