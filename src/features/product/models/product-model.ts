import type { ProductResponse } from '../../../api/Api';
import { createRepository } from '../../../lib/in-memory-repository';
export const productStatuses = ['啟用', '停用'] as const;
export const productRepository = createRepository<Required<ProductResponse>>([]);
export function cacheProduct(record: Required<ProductResponse>) {
  const records = productRepository.getSnapshot();
  productRepository.replaceAll(records.some(item => item.id === record.id)
    ? records.map(item => item.id === record.id ? record : item) : [record, ...records]);
}
