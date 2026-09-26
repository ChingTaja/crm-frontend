import type { Api, FieldMetadata } from '../api/Api';
import type { FilterField } from './filter-fields';

export function createEntityFieldsApi(client: Api<unknown>['api']) {
  return async (signal: AbortSignal, entity: string): Promise<FieldMetadata[]> => {
    const response = await client.findFieldsByEntityName(encodeURIComponent(entity), { signal, format: 'json' });
    if (response.error || !Array.isArray(response.data) || !response.data.length ||
      response.data.some(field => !field || !(field.apiFieldName || field.name))) {
      throw new Error('欄位設定回傳格式不正確。');
    }
    return response.data;
  };
}

export function metadataFields(metadata: FieldMetadata[]): FilterField[] {
  return metadata.map(field => {
    const apiFieldName = field.apiFieldName || field.name!;
    const type = field.type?.toLowerCase();
    return {
      apiFieldName,
      label: field.displayName || field.name || apiFieldName,
      type: type === 'option' || type === 'lookup' || type === 'date' || type === 'number' || type === 'email' || type === 'phone'
        ? type : 'text',
      options: field.options?.map(option => ({ value: option.key ?? option.value ?? '', label: option.value ?? option.key ?? '' })),
      hideable: apiFieldName !== 'name',
    };
  });
}

function fieldValue(record: object, path: string): string {
  const value = path.split('.').reduce<unknown>((current, key) =>
    current && typeof current === 'object' ? Reflect.get(current, key) : undefined, record);
  if (value == null) return '';
  if (typeof value === 'object') {
    const option = value as { key?: string; value?: string };
    return option.key ?? option.value ?? '';
  }
  return String(value);
}

export function metadataRows(records: { id?: string; name?: string }[], fields: FilterField[]) {
  return records.map(record => {
    const filterValues = fields.map(field => {
      const value = fieldValue(record, field.apiFieldName!);
      return field.options?.find(option => option.value === value || option.label === value)?.value ?? value;
    });
    const displayValues = filterValues.map((value, index) =>
      fields[index].options?.find(option => option.value === value)?.label ?? value);
    return { id: record.id ?? '', name: record.name ?? '', filterValues, displayValues, cells: displayValues };
  });
}
