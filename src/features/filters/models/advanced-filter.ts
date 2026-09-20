export const filterOperators = {
  contains: '包含',
  notContains: '不包含',
  equals: '等於',
  notEquals: '不等於',
  startsWith: '開頭是',
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
export function matchesAdvancedFilter(values: string[], node: FilterNode): boolean {
  if (node.kind === 'group') {
    if (!node.children.length) return true;
    const check = (child: FilterNode) => matchesAdvancedFilter(values, child);
    return node.match === 'all' ? node.children.every(check) : node.children.some(check);
  }
  const actual = (values[node.field] ?? '').trim().toLocaleLowerCase();
  const expected = node.value.trim().toLocaleLowerCase();
  switch (node.operator) {
    case 'contains':
      return actual.includes(expected);
    case 'notContains':
      return !actual.includes(expected);
    case 'equals':
      return actual === expected;
    case 'notEquals':
      return actual !== expected;
    case 'startsWith':
      return actual.startsWith(expected);
    case 'empty':
      return actual === '' || actual === '—';
    case 'notEmpty':
      return actual !== '' && actual !== '—';
  }
}
