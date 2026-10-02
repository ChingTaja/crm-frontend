import { useState } from 'react';
import { orderRepository, orderTransitions, type Order } from '../models/order-model';

export function useOrderEditViewModel(record: Order) {
  const [error, setError] = useState('');
  function changeStatus(status: Order['status']) {
    setError('');
    try {
      const current = orderRepository.getSnapshot().find(item => item.id === record.id);
      if (!current || current.status !== record.status) throw new Error('訂單狀態已變更，請重新確認。');
      orderRepository.save({ ...current, status });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '無法更新訂單狀態。');
    }
  }
  return { error, changeStatus, nextStatuses: orderTransitions[record.status] };
}
