import { getFieldOperators, type FilterField } from '../../../lib/filter-fields';
import { requiresFilterValue, type FilterGroup, type FilterNode, type FilterOperator } from './advanced-filter';

// Proposed backend contract. UI IDs and column indexes never cross the API boundary.
export type SearchFilter =
  | { kind: 'group'; match: 'all' | 'any'; children: SearchFilter[] }
  | { kind: 'rule'; field: string; operator: FilterOperator; value?: string | number };
export interface EntitySearchRequest {
  page: number;
  size: number;
  keyword?: string;
  filter?: SearchFilter;
  sort?: { field: string; direction: 'asc' | 'desc' }[];
}

export function validateFilter(node: FilterNode, fields: FilterField[], root = true): string | null {
  if (node.kind === 'group') {
    if (!root && !node.children.length) return '請移除空白群組。';
    return node.children.map(child => validateFilter(child, fields, false)).find(Boolean) ?? null;
  }
  const field = fields[node.field];
  if (!field) return '篩選欄位已不存在，請重新選擇。';
  if (!getFieldOperators(field).includes(node.operator)) return `${field.label}不支援此比較方式。`;
  if (!requiresFilterValue(node.operator)) return null;
  const value = node.value.trim();
  if (!value) return `請填寫${field.label}的篩選值。`;
  if (field.type === 'number' && !Number.isFinite(Number(value))) return `${field.label}必須為有效數字。`;
  if (field.type === 'date' && (!/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value)) return `${field.label}必須為有效日期。`;
  return null;
}

export function serializeFilter(node: FilterNode, fields: FilterField[]): SearchFilter {
  const error = validateFilter(node, fields);
  if (error) throw new Error(error);
  if (node.kind === 'group') return { kind: 'group', match: node.match, children: node.children.map(child => serializeFilter(child, fields)) };
  const field = fields[node.field];
  if (!field.apiFieldName) throw new Error(`${field.label}缺少 API 欄位名稱。`);
  return { kind: 'rule', field: field.apiFieldName, operator: node.operator,
    ...(requiresFilterValue(node.operator) ? { value: field.type === 'number' ? Number(node.value) : node.value.trim() } : {}),
  };
}

export function createSearchRequest(fields: FilterField[], advanced: FilterGroup,
  simple: { field: number; operator: FilterOperator; value: string } | null,
  page: number, size: number, keyword = '', sort: EntitySearchRequest['sort'] = []): EntitySearchRequest {
  const children: FilterNode[] = [...(advanced.children.length ? [advanced] : []),
    ...(simple ? [{ ...simple, kind: 'rule' as const, id: 'simple' }] : [])];
  return { page, size, ...(keyword.trim() ? { keyword: keyword.trim() } : {}),
    ...(children.length ? { filter: serializeFilter({ kind: 'group', id: 'root', match: 'all', children }, fields) } : {}),
    ...(sort.length ? { sort } : {}),
  };
}
