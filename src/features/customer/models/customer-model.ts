import type { CustomerResponse } from '../../../api/Api';
import { createRepository } from '../../../lib/in-memory-repository';

export const customerRepository = createRepository<CustomerResponse>([]);
export function cacheCustomer(customer: CustomerResponse) {
  const records = customerRepository.getSnapshot();
  customerRepository.replaceAll(
    records.some((item) => item.id === customer.id)
      ? records.map((item) => (item.id === customer.id ? customer : item))
      : [customer, ...records]
  );
}
