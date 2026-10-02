import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { useApi } from '@/hooks/use-api';
import { productApi } from '../models/product-service';
import { productRepository } from '../models/product-model';

export function useProductsQuery() {
  const records = useSyncExternalStore(productRepository.subscribe, productRepository.getSnapshot);
  const { execute, cancel, ...state } = useApi(productApi.listAll);
  const reload = useCallback(() => {
    // Errors are exposed through useApi; never substitute demo records.
    void execute()
      .then(productRepository.replaceAll)
      .catch(() => {});
  }, [execute]);
  useEffect(() => {
    reload();
    return cancel;
  }, [reload, cancel]);
  return { ...state, records, reload };
}
