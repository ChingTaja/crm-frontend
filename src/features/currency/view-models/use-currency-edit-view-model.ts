import { useApi } from '@/hooks/use-api';
import { useEntityForm } from '@/hooks/use-entity-form';
import type { Currency } from '../models/currency-model';
import { currencyRecords } from '../models/currency-model';
import { currencyApi } from '../models/currency-service';

export function useCurrencyEditViewModel(record?: Currency) {
  const request = useApi(currencyApi.save);
  const initial: Currency = record ?? { code: '', name: '', symbol: '', fractionDigits: 2, active: true };
  return useEntityForm('currencies', initial, async draft => {
    const payload = { ...draft, code: draft.code.trim().toUpperCase(), symbol: draft.symbol.trim() };
    if (!/^[A-Z]{3}$/.test(payload.code)) throw new Error('請輸入三碼英文字母幣別代碼。');
    if (!payload.symbol) throw new Error('請輸入幣別符號。');
    currencyRecords([payload]);
    await request.execute(payload, record?.code);
  });
}
