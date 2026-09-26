import { useState } from 'react';
import { moveField } from '@/lib/field-order';

export function useFieldOrder(count: number) {
  const [storedOrder, setFieldOrder] = useState(() => Array.from({ length: count }, (_, index) => index));
  const fieldOrder = [...storedOrder.filter(index => index < count),
    ...Array.from({ length: count }, (_, index) => index).filter(index => !storedOrder.includes(index))];
  return {
    fieldOrder,
    moveField: (source: number, target: number) => setFieldOrder(moveField(fieldOrder, source, target)),
  };
}
