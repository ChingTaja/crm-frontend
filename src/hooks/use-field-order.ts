import { useState } from 'react';
import { moveField } from '@/lib/field-order';

export function useFieldOrder(count: number) {
  const [fieldOrder, setFieldOrder] = useState(() => Array.from({ length: count }, (_, index) => index));
  return {
    fieldOrder,
    moveField: (source: number, target: number) => setFieldOrder((current) => moveField(current, source, target)),
  };
}
