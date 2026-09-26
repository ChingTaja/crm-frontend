import { useEffect } from 'react';
import { useContactViewModel } from '../view-models/use-contact-view-model';
import { ContactEditView } from './contact-edit-view';
import { EntityWorkspace } from '@/components/layout/entity-workspace';
import { CustomerSidebar } from '@/components/layout/customer-sidebar';
import { EntityList } from '@/components/entity/entity-list';
import { EntityRequestError } from '@/components/entity/entity-request-error';
import { useApi } from '@/hooks/use-api';
import { contactApi } from '../models/contact-service';
import { cacheContact } from '../models/contact-model';

function ContactListView() {
  const vm = useContactViewModel();
  if (vm.request.error) return <EntityRequestError title="聯絡人" entity="contacts" error={vm.request.error} retry={vm.request.reload} />;
  if (!vm.request.data || vm.request.isLoading)
    return (
      <p role="status" className="py-10 text-muted-foreground">
        載入聯絡人…
      </p>
    );
  return <EntityList vm={vm} dataNotice={null} />;
}

function ContactDetailView({ id }: { id: string }) {
  const { data, error, execute, cancel } = useApi(contactApi.get);
  useEffect(() => {
    void execute(id)
      .then(cacheContact)
      .catch(() => {});
    return cancel;
  }, [id, execute, cancel]);
  if (error)
    return (
      <EntityRequestError title="聯絡人" entity="contacts"
        error={error}
        retry={() => {
          void execute(id)
            .then(cacheContact)
            .catch(() => {});
        }}
      />
    );
  if (!data)
    return (
      <p role="status" className="py-10 text-muted-foreground">
        載入聯絡人資料…
      </p>
    );
  return <ContactEditView contact={data} />;
}

export function ContactView({ recordId }: { recordId?: string }) {
  return (
    <EntityWorkspace relationship sidebar={<CustomerSidebar isCustomers={false} />}>
      {!recordId ? (
        <ContactListView />
      ) : recordId === 'new' ? (
        <ContactEditView key="new" />
      ) : (
        <ContactDetailView key={recordId} id={recordId} />
      )}
    </EntityWorkspace>
  );
}
