import type { ContactResponse } from '../../../api/Api';
import { createRepository } from '../../../lib/in-memory-repository';

export const contactRepository = createRepository<ContactResponse>([]);
export function cacheContact(contact: ContactResponse) {
  const records = contactRepository.getSnapshot();
  contactRepository.replaceAll(
    records.some((item) => item.id === contact.id)
      ? records.map((item) => (item.id === contact.id ? contact : item))
      : [contact, ...records]
  );
}
