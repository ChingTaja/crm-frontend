import { useEffect, useRef, useState } from 'react';
import type { OrderResponse, UpdateOrderStatusRequest } from '../../../api/Api';
import { useApi } from '@/hooks/use-api';
import { orderApi } from '../models/order-service';

export function useOrderEditViewModel(id: string) {
  const [record, setRecord] = useState<OrderResponse>();
  const [reason, setReason] = useState('');
  const busy = useRef(false);
  const read = useApi(orderApi.get);
  const mutation = useApi(orderApi.updateStatus);
  const { execute, cancel } = read;
  useEffect(() => {
    void execute(id)
      .then(setRecord)
      .catch(() => {});
    return cancel;
  }, [id, execute, cancel]);
  function reload() {
    mutation.reset();
    void execute(id)
      .then(setRecord)
      .catch(() => {});
  }
  async function changeStatus(status: UpdateOrderStatusRequest['status']) {
    if (busy.current || !record?.allowedTransitions?.includes(status) || record.revision == null) return;
    if (status === 'Cancelled' && !reason.trim()) return;
    busy.current = true;
    try {
      setRecord(
        await mutation.execute(id, {
          status,
          expectedRevision: record.revision,
          ...(status === 'Cancelled' ? { reason: reason.trim() } : {}),
        })
      );
      setReason('');
    } catch {
      /* useApi exposes the backend error; keep the user's reason for retry. */
    } finally {
      busy.current = false;
    }
  }
  return {
    record,
    reason,
    setReason,
    reload,
    changeStatus,
    error: read.error ?? mutation.error,
    isLoading: read.isLoading,
    isSaving: mutation.isLoading,
  };
}
