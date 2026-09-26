import { useCallback, useEffect } from 'react';
import { createGeneratedApi } from '../api/client';
import { createEntityFieldsApi, metadataFields } from '../lib/entity-fields';
import { useApi } from './use-api';

const loadFields = createEntityFieldsApi(createGeneratedApi(import.meta.env.VITE_API_BASE_URL || '/api').api);

export function useEntityFields(entity: string) {
  const { execute, cancel, ...state } = useApi(loadFields);
  const reload = useCallback(() => execute(entity), [execute, entity]);
  useEffect(() => { void reload().catch(() => {}); return cancel }, [reload, cancel]);
  return { ...state, reload, fields: metadataFields(state.data ?? []) };
}
