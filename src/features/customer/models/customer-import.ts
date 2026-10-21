import type { CreateCustomerRequest, CustomerResponse } from '../../../api/Api';

export const customerImportMaxBytes = 5 * 1024 * 1024;
export const customerImportMaxRows = 500;
export const customerImportColumns = [
  { key: 'name', label: '客戶名稱' },
  { key: 'company', label: '公司' },
  { key: 'email', label: '電子郵件' },
  { key: 'phone', label: '電話' },
  { key: 'owner', label: '客戶所有者' },
] as const;
export type CustomerImportStatus = 'ready' | 'invalid' | 'duplicate' | 'success' | 'failed' | 'uncertain' | 'skipped';
export interface CustomerImportRow {
  rowNumber: number;
  customer: CreateCustomerRequest;
  status: CustomerImportStatus;
  messages: string[];
}

export function validateCustomerImportFile(file: { name: string; size: number }) {
  if (!/\.csv$/i.test(file.name)) throw new Error('僅支援 .csv 格式，請下載並使用匯入範本。');
  if (!file.size) throw new Error('檔案是空的，請重新選擇。');
  if (file.size > customerImportMaxBytes) throw new Error('檔案不可超過 5 MB。');
}

function normalized(value?: string) { return (value ?? '').trim(); }
function customerKey(customer: CreateCustomerRequest) { return `${normalized(customer.name)}\u0000${normalized(customer.company)}`; }

export function markCustomerImportDuplicates(rows: CustomerImportRow[], existing: CustomerResponse[]) {
  const keys = new Set(existing.filter(item => item.name?.trim()).map(customerKey));
  const emails = new Set(existing.map(item => normalized(item.email).toLowerCase()).filter(Boolean));
  return rows.map(row => {
    if (row.status !== 'ready') return row;
    const key = customerKey(row.customer);
    const email = normalized(row.customer.email).toLowerCase();
    const duplicate = keys.has(key) || (!!email && emails.has(email));
    keys.add(key);
    if (email) emails.add(email);
    return duplicate ? { ...row, status: 'duplicate' as const, messages: ['客戶名稱與公司相同，或 Email 已存在於系統／本檔案，將略過。'] } : row;
  });
}

interface CsvRecord { lineNumber: number; cells: string[] }

function readCsv(text: string): CsvRecord[] {
  const records: CsvRecord[] = [];
  let cells: string[] = [], value = '', state: 'start' | 'plain' | 'quoted' | 'closed' = 'start';
  let lineNumber = 1, recordLine = 1;
  const cell = () => {
    cells.push(value); value = ''; state = 'start';
    if (cells.length > 20) throw new Error('CSV 欄位過多，請使用下載的範本。');
  };
  const record = () => {
    cell();
    if (cells.some(item => item.trim())) records.push({ lineNumber: recordLine, cells });
    cells = [];
    if (records.length > customerImportMaxRows + 1) throw new Error('每次最多 500 筆，請拆分檔案後上傳。');
  };
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (state === 'quoted') {
      if (char === '"') {
        if (text[index + 1] === '"') { value += '"'; index++; }
        else state = 'closed';
      } else {
        value += char;
        if (char === '\r') {
          if (text[index + 1] === '\n') { value += '\n'; index++; }
          lineNumber++;
        } else if (char === '\n') lineNumber++;
      }
    } else if (char === ',') cell();
    else if (char === '\r' || char === '\n') {
      record();
      if (char === '\r' && text[index + 1] === '\n') index++;
      lineNumber++; recordLine = lineNumber;
    } else if (char === '"' && state === 'start') state = 'quoted';
    else if (state === 'closed' && (char === ' ' || char === '\t')) continue;
    else if (char === '"' || state === 'closed') throw new Error(`CSV 第 ${lineNumber} 列引號格式不正確，請檢查逗號及雙引號。`);
    else { value += char; state = 'plain'; }
  }
  if (state === 'quoted') throw new Error(`CSV 第 ${recordLine} 列的雙引號未關閉。`);
  if (value || cells.length || state === 'closed') record();
  return records;
}

export async function parseCustomerImport(data: ArrayBuffer): Promise<CustomerImportRow[]> {
  if (data.byteLength > customerImportMaxBytes) throw new Error('檔案不可超過 5 MB。');
  let text: string;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(data).replace(/^\uFEFF/, ''); }
  catch { throw new Error('請將 CSV 儲存為 UTF-8 編碼後重新上傳。'); }
  if (text.includes('\0')) throw new Error('請使用 UTF-8 編碼的純文字 CSV。');
  const records = readCsv(text);
  if (!records.length) throw new Error('CSV 是空的，請使用下載的範本。');
  const header = records[0].cells;
  const columns = new Map<string, number>();
  header.forEach((value, index) => {
    const label = value.trim().replace(/\s*[*＊]$/, '');
    if (!label) return;
    const column = customerImportColumns.find(item => item.label === label || item.key === label);
    if (!column) throw new Error(`不支援欄位「${label}」，請使用匯入範本的欄位名稱。`);
    if (columns.has(column.key)) throw new Error(`欄位「${label}」重複，請修正後再上傳。`);
    columns.set(column.key, index);
  });
  if (!columns.has('name')) throw new Error('第一列必須包含「客戶名稱」欄位。');
  const rows: CustomerImportRow[] = [];
  for (const source of records.slice(1)) {
    const customer: CreateCustomerRequest = {};
    const messages: string[] = [];
    if (source.cells.length > header.length && source.cells.slice(header.length).some(value => value.trim())) messages.push('資料欄位多於標題欄位，請檢查逗號及雙引號。');
    source.cells.forEach((value, index) => {
      if (value.trim() && index < header.length && !header[index].trim()) messages.push(`第 ${index + 1} 欄缺少欄位名稱。`);
    });
    for (const column of customerImportColumns) {
      const position = columns.get(column.key);
      if (position === undefined) continue;
      customer[column.key] = (source.cells[position] ?? '').trim();
    }
    if (!customer.name?.trim()) messages.push('客戶名稱為必填。');
    if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) messages.push('電子郵件格式不正確。');
    for (const column of customerImportColumns) {
      if ((customer[column.key]?.length ?? 0) > 255) messages.push(`${column.label}不可超過 255 個字元。`);
    }
    rows.push({ rowNumber: source.lineNumber, customer, status: messages.length ? 'invalid' : 'ready', messages });
  }
  if (!rows.length) throw new Error('請在 CSV 標題列下方填寫至少一筆客戶資料。');
  return markCustomerImportDuplicates(rows, []);
}

export function createCustomerImportTemplate(includeExample = false): ArrayBuffer {
  const escape = (value: string) => /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  const rows: string[][] = [customerImportColumns.map(column => column.label)];
  if (includeExample) rows.push(['範例客戶', '範例有限公司', 'customer@example.com', '0912345678', '王小明']);
  return new TextEncoder().encode('\uFEFF' + rows.map(row => row.map(escape).join(',')).join('\r\n') + '\r\n').buffer;
}
