import type { CustomerResponse } from '../../../api/Api';
import { useEntityForm } from '@/hooks/use-entity-form';
import { useApi } from '@/hooks/use-api';
import { customerApi } from '../models/customer-service';
import { cacheCustomer } from '../models/customer-model';

export function useCustomerEditViewModel(customer?: CustomerResponse) {
  const request = useApi(customerApi.save);
  const initial: CustomerResponse = { name: '', company: '', email: '', phone: '', owner: '', ...customer };
  const form = useEntityForm('customers', initial, async draft => {
    cacheCustomer(await request.execute({ ...draft, email: draft.email?.trim(), phone: draft.phone?.trim() }));
  });
  return { ...form, isNew: !customer, updateField: form.update };
}
