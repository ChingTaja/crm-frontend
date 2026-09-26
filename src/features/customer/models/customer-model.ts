import type { CustomerResponse, CreateCustomerRequest } from '../../../api/Api';
import { createRepository } from '../../../lib/in-memory-repository';

const repository = createRepository<CustomerResponse>([]);
export function cacheCustomer(customer: CustomerResponse) {
  const records = repository.getSnapshot();
  repository.replaceAll(records.some(item => item.id === customer.id)
    ? records.map(item => item.id === customer.id ? customer : item)
    : [customer, ...records]);
}
export const customerRepository = {
  ...repository,
  create: (customer: CreateCustomerRequest) => repository.save(customer),
  update: cacheCustomer,
};
