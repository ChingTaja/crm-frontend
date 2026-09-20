import { useState, useSyncExternalStore, type FormEvent } from 'react'
import { contactRepository, customerRepository, type Contact } from '../models/customer-model'

export function useContactEditViewModel(contact?: Contact) {
  const customers = useSyncExternalStore(customerRepository.subscribe, customerRepository.getSnapshot)
  const isNew = !contact
  const [initial] = useState<Contact>(() => contact ? { ...contact } : {
    id: '', name: '', customerId: '', title: '', email: '', phone: '', createdAt: new Date().toLocaleDateString('en-CA'),
  })
  const [draft, setDraft] = useState({ ...initial })
  const [error, setError] = useState('')
  const back = () => { window.location.hash = '/contacts' }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.name.trim()) { setError('請輸入聯絡人姓名。'); return }
    if (!customers.some(customer => customer.id === draft.customerId)) {
      setError('請選擇有效的所屬客戶。')
      return
    }
    contactRepository[isNew ? 'create' : 'update']({ ...draft, name: draft.name.trim(), email: draft.email.trim(), phone: draft.phone.trim(), title: draft.title.trim() })
    back()
  }

  return {
    draft, customers, error, save, back, isNew,
    reset: () => { setDraft({ ...initial }); setError('') },
    updateField: (field: keyof Contact, value: string) => {
      setDraft(current => ({ ...current, [field]: value }))
      setError('')
    },
  }
}
