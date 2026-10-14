export interface Currency {
  code: string;
  name: string;
  symbol: string;
  fractionDigits: number;
  active: boolean;
}

export const defaultCurrency = 'TWD';

export function currencyRecords(data: unknown): Currency[] {
  if (!Array.isArray(data)) throw new Error('幣別列表格式不正確');
  const codes = new Set<string>();
  return data.map((record: Currency) => {
    if (!record || !/^[A-Z]{3}$/.test(record.code) || codes.has(record.code) ||
      typeof record.name !== 'string' || !record.name.trim() || typeof record.symbol !== 'string' ||
      !Number.isInteger(record.fractionDigits) || record.fractionDigits < 0 || record.fractionDigits > 3 ||
      typeof record.active !== 'boolean') throw new Error('幣別資料格式不正確');
    codes.add(record.code);
    return record;
  });
}

// Existing totals use hundredths (Cents), independently of the display currency.
export function formatMoney(cents: number, currency = defaultCurrency): string {
  if (!Number.isFinite(cents)) return '—';
  if (!/^[A-Z]{3}$/.test(currency)) return '幣別未提供';
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency', currency, currencyDisplay: 'code',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(Number.isFinite(cents) ? cents / 100 : 0);
}
