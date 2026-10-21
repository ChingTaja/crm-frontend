import type { CustomerImportRequest, CustomerImportResponse } from '../../../api/Api';
import { customerImportMaxRows, type CustomerImportRow } from './customer-import';

export interface CustomerImportBatch {
  idempotencyKey: string;
  request: CustomerImportRequest;
}

export function createCustomerImportBatch(rows: CustomerImportRow[], idempotencyKey: string): CustomerImportBatch {
  if (!/^[A-Za-z0-9._:-]{1,128}$/.test(idempotencyKey)) throw new Error('匯入識別碼格式不正確。');
  const ready = rows.filter(row => row.status === 'ready');
  if (!ready.length || ready.length > customerImportMaxRows) throw new Error('每次須匯入 1 至 500 筆有效資料。');
  const numbers = new Set<number>();
  return { idempotencyKey, request: { rows: ready.map(row => {
    if (!Number.isInteger(row.rowNumber) || row.rowNumber <= 0 || numbers.has(row.rowNumber)) throw new Error('匯入列號必須是不重複的正整數。');
    numbers.add(row.rowNumber);
    return { rowNumber: row.rowNumber, name: row.customer.name ?? '', company: row.customer.company,
      email: row.customer.email, phone: row.customer.phone, owner: row.customer.owner };
  }) } };
}

export function validateCustomerImportResponse(request: CustomerImportRequest, key: string, data: CustomerImportResponse) {
  const expected = new Set(request.rows.map(row => row.rowNumber));
  const seen = new Set<number>();
  if (!data || data.idempotencyKey !== key || data.total !== expected.size || !Array.isArray(data.results) || data.results.length !== expected.size)
    throw new Error('批次匯入回應不完整，請使用原批次重新取得結果。');
  for (const row of data.results) {
    if (!row || !expected.has(row.rowNumber) || seen.has(row.rowNumber) || !['success', 'skipped', 'failed'].includes(row.status) ||
      typeof row.reason !== 'string' || typeof row.code !== 'string' || (row.status === 'success' && (typeof row.customerId !== 'string' || !row.customerId.trim())))
      throw new Error('批次匯入回應格式不正確，請使用原批次重新取得結果。');
    seen.add(row.rowNumber);
  }
  if (data.successCount !== data.results.filter(row => row.status === 'success').length ||
    data.skippedCount !== data.results.filter(row => row.status === 'skipped').length ||
    data.failedCount !== data.results.filter(row => row.status === 'failed').length)
    throw new Error('批次匯入結果筆數不一致，請使用原批次重新取得結果。');
  return data;
}

export function applyCustomerImportResult(rows: CustomerImportRow[], batch: CustomerImportBatch, response: CustomerImportResponse): CustomerImportRow[] {
  validateCustomerImportResponse(batch.request, batch.idempotencyKey, response);
  const results = new Map(response.results.map(row => [row.rowNumber, row]));
  return rows.map(row => {
    const result = results.get(row.rowNumber);
    return result ? { ...row, status: result.status, messages: [result.reason || result.code] } : row;
  });
}
