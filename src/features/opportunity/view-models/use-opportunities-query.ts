import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { useApi } from '@/hooks/use-api';
import { opportunityApi } from '../models/opportunity-service';
import { opportunityRepository } from '../models/opportunity-model';

export function useOpportunitiesQuery() {
  const records = useSyncExternalStore(opportunityRepository.subscribe, opportunityRepository.getSnapshot);
  const { execute, cancel, ...state } = useApi(opportunityApi.listAll);
  const reload = useCallback(() => {
    // Errors are exposed through useApi; never substitute demo records.
    void execute()
      .then(opportunityRepository.replaceAll)
      .catch(() => {});
  }, [execute]);
  useEffect(() => {
    reload();
    return cancel;
  }, [reload, cancel]);
  return { ...state, records, reload };
}
