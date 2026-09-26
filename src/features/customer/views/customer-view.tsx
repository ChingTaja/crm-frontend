import { useEffect } from 'react';
import { useCustomerViewModel } from '../view-models/use-customer-view-model';
import { CustomerEditView } from './customer-edit-view';
import { EntityWorkspace } from '@/components/layout/entity-workspace';
import { CustomerSidebar } from '@/components/layout/customer-sidebar';
import { EntityList } from '@/components/entity/entity-list';
import { EntityRequestError } from '@/components/entity/entity-request-error';
import { useApi } from '@/hooks/use-api';
import { customerApi } from '../models/customer-service';
import { cacheCustomer } from '../models/customer-model';

function CustomerListView() {
  const vm = useCustomerViewModel();
  if (vm.request.error) return <EntityRequestError title="客戶" entity="customers" error={vm.request.error} retry={vm.request.reload} />;
  if (!vm.request.data || vm.request.isLoading)
    return (
      <p role="status" className="py-10 text-muted-foreground">
        載入客戶…
      </p>
    );
  return <EntityList vm={vm} dataNotice={null} />;
}

function CustomerDetailView({ id }: { id: string }) {
  const { data, error, execute, cancel } = useApi(customerApi.get);
  useEffect(() => {
    void execute(id)
      .then(cacheCustomer)
      .catch(() => {});
    return cancel;
  }, [id, execute, cancel]);
  if (error)
    return (
      <EntityRequestError title="客戶" entity="customers"
        error={error}
        retry={() => {
          void execute(id)
            .then(cacheCustomer)
            .catch(() => {});
        }}
      />
    );
  if (!data)
    return (
      <p role="status" className="py-10 text-muted-foreground">
        載入客戶資料…
      </p>
    );
  return <CustomerEditView customer={data} />;
}

export function CustomerView({ recordId }: { recordId?: string }) {
  return (
    <EntityWorkspace relationship sidebar={<CustomerSidebar isCustomers={true} />}>
      {!recordId ? (
        <CustomerListView />
      ) : recordId === 'new' ? (
        <CustomerEditView key="new" />
      ) : (
        <CustomerDetailView key={recordId} id={recordId} />
      )}
    </EntityWorkspace>
  );
}
