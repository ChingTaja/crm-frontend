import type { FilterField } from '../../../lib/filter-fields';
export const filterOperators = {
  contains: '包含',
  notContains: '不包含',
  equals: '等於',
  notEquals: '不等於',
  startsWith: '開頭是',
  greaterThan: '大於／晚於',
  greaterThanOrEqual: '大於等於／不早於',
  lessThan: '小於／早於',
  lessThanOrEqual: '小於等於／不晚於',
  empty: '為空',
  notEmpty: '不為空',
} as const;
export type FilterOperator = keyof typeof filterOperators;
export interface FilterRule {
  kind: 'rule';
  id: string;
  field: number;
  operator: FilterOperator;
  value: string;
}
export interface FilterGroup {
  kind: 'group';
  id: string;
  match: 'all' | 'any';
  children: FilterNode[];
}
export type FilterNode = FilterRule | FilterGroup;
export const createFilterGroup = (): FilterGroup => ({
  kind: 'group',
  id: crypto.randomUUID(),
  match: 'all',
  children: [],
});
export const createFilterRule = (): FilterRule => ({
  kind: 'rule',
  id: crypto.randomUUID(),
  field: 0,
  operator: 'contains',
  value: '',
});
export const requiresFilterValue = (operator: FilterOperator) => operator !== 'empty' && operator !== 'notEmpty';

export function countFilterRules(node: FilterNode): number {
  return node.kind === 'rule' ? 1 : node.children.reduce((sum, child) => sum + countFilterRules(child), 0);
}

export function isFilterComplete(node: FilterNode): boolean {
  return node.kind === 'rule'
    ? !requiresFilterValue(node.operator) || node.value.trim().length > 0
    : node.children.length > 0 && node.children.every(isFilterComplete);
}

/** An empty root is an unfiltered list; UI prevents applying empty nested groups. */
export function matchesAdvancedFilter(values: string[], node: FilterNode, fields?: FilterField[]): boolean {
  if (node.kind === 'group') {
    if (!node.children.length) return true;
    const check = (child: FilterNode) => matchesAdvancedFilter(values, child, fields);
    return node.match === 'all' ? node.children.every(check) : node.children.some(check);
  }
  const actual = (values[node.field] ?? '').trim().toLocaleLowerCase();
  const expected = node.value.trim().toLocaleLowerCase();
  const type = fields?.[node.field]?.type;
  const numeric = type === 'number';
  const left = numeric ? Number(actual) : actual;
  const right = numeric ? Number(expected) : expected;
  const comparable = actual !== '' && actual !== '—' && expected !== '' && (!numeric || (Number.isFinite(left) && Number.isFinite(right)));
  switch (node.operator) {
    case 'greaterThan': return comparable && left > right;
    case 'greaterThanOrEqual': return comparable && left >= right;
    case 'lessThan': return comparable && left < right;
    case 'lessThanOrEqual': return comparable && left <= right;
    case 'contains':
      return actual.includes(expected);
    case 'notContains':
      return !actual.includes(expected);
    case 'equals':
      return numeric ? comparable && left === right : actual === expected;
    case 'notEquals':
      return numeric ? !comparable || left !== right : actual !== expected;
    case 'startsWith':
      return actual.startsWith(expected);
    case 'empty':
      return actual === '' || actual === '—';
    case 'notEmpty':
      return actual !== '' && actual !== '—';
  }
}
