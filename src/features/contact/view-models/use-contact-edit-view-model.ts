import type { ContactResponse } from '../../../api/Api';
import { useEntityForm } from '@/hooks/use-entity-form';
import { useApi } from '@/hooks/use-api';
import { useCustomersQuery } from '@/features/customer/view-models/use-customers-query';
import { contactApi } from '../models/contact-service';
import { cacheContact } from '../models/contact-model';

export function useContactEditViewModel(contact?: ContactResponse) {
  const customerQuery = useCustomersQuery();
  const request = useApi(contactApi.save);
  const initial: ContactResponse = {
    name: '', company: '', email: '', phone: '', owner: '', customerId: '', ...contact,
  };
  const form = useEntityForm('contacts', initial, async draft => {
    if (customerQuery.isLoading) throw new Error('客戶資料載入中，請稍後再試。');
    if (customerQuery.error) throw new Error('無法載入客戶，請重試。');
    if (!draft.customerId || !customerQuery.records.some(customer => customer.id === draft.customerId)) {
      throw new Error('請選擇有效的所屬客戶。');
    }
    cacheContact(await request.execute({ ...draft, email: draft.email?.trim(), phone: draft.phone?.trim() }));
  });
  return { ...form, customerQuery };
}
