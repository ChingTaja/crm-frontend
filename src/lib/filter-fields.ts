import { type FilterOperator } from '../features/filter/models/advanced-filter';

export interface FilterField {
  apiFieldName?: string;
  label: string;
  type: 'text' | 'option' | 'lookup' | 'date' | 'number' | 'email' | 'phone';
  hideable?: boolean;
  options?: { value: string; label: string }[];
}

export function getFieldOperators(field: FilterField): FilterOperator[] {
  if (field.type === 'date' || field.type === 'number')
    return [
      'equals',
      'notEquals',
      'greaterThan',
      'greaterThanOrEqual',
      'lessThan',
      'lessThanOrEqual',
      'empty',
      'notEmpty',
    ];
  if (field.type === 'option' || field.type === 'lookup') {
    return ['equals', 'notEquals', 'empty', 'notEmpty'];
  }
  return ['contains', 'notContains', 'equals', 'notEquals', 'startsWith', 'empty', 'notEmpty'];
}
export function defaultFieldOperator(field: FilterField): FilterOperator {
  return getFieldOperators(field)[0];
}
export function filterValueLabel(field: FilterField, value: string): string {
  return field.options?.find((option) => option.value === value)?.label ?? value;
}
export function uniqueOptions(values: string[]) {
  return [...new Set(values.filter(Boolean))].map((value) => ({ value, label: value }));
}
