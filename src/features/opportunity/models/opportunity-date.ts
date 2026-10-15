import { FieldValidationError } from '../../../lib/form-validation';

export function earliestExpectedCloseDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const part = (type: string) => Number(parts.find(value => value.type === type)!.value);
  return new Date(Date.UTC(part('year'), part('month') - 1, part('day') + 1)).toISOString().slice(0, 10);
}

export function validateExpectedCloseDate(value: string | undefined, now = new Date()) {
  if (!value) return;
  const date = new Date(`${value}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new FieldValidationError({ expectedCloseDate: '請輸入有效的預計成交日。' });
  }
  if (value < earliestExpectedCloseDate(now)) {
    throw new FieldValidationError({ expectedCloseDate: '預計成交日須在今天之後，請選擇明天或更晚的日期。' });
  }
}
