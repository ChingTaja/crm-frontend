import { useState, type FormEvent } from 'react';
import { customerRepository, type Customer } from '../models/customer-model';

export function useCustomerEditViewModel(customer?: Customer) {
  const isNew = !customer;
  const [initial] = useState<Customer>(() =>
    customer
      ? { ...customer }
      : {
          id: '',
          name: '',
          industry: '',
          owner: '',
          address: '',
          createdAt: new Date().toLocaleDateString('en-CA'),
        }
  );
  const [draft, setDraft] = useState({ ...initial });
  const [error, setError] = useState('');
  const back = () => {
    window.location.hash = '/customers';
  };

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.name.trim()) {
      setError('請輸入客戶名稱。');
      return;
    }
    customerRepository[isNew ? 'create' : 'update']({ ...draft, name: draft.name.trim() });
    back();
  }

  return {
    draft,
    error,
    save,
    back,
    isNew,
    reset: () => {
      setDraft({ ...initial });
      setError('');
    },
    updateField: (field: keyof Customer, value: string) => {
      setDraft((current) => ({ ...current, [field]: value }));
      setError('');
    },
  };
}
