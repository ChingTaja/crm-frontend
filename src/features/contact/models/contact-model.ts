import type { ContactResponse, CreateContactRequest } from '../../../api/Api';
import { createRepository } from '../../../lib/in-memory-repository';

const repository = createRepository<ContactResponse>([]);
export function cacheContact(contact: ContactResponse) {
  const records = repository.getSnapshot();
  repository.replaceAll(records.some(item => item.id === contact.id)
    ? records.map(item => item.id === contact.id ? contact : item)
    : [contact, ...records]);
}
export const contactRepository = {
  ...repository,
  create: (contact: CreateContactRequest) => repository.save(contact),
  update: cacheContact,
};
