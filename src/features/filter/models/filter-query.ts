import { getFieldOperators, type FilterField } from '../../../lib/filter-fields';
import { requiresFilterValue, type FilterNode } from './advanced-filter';

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
