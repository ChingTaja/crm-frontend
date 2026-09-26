import { useEffect } from 'react';
import { useLeadViewModel } from '../view-models/use-lead-view-model';
import { LeadEditView } from './lead-edit-view';
import { EntityWorkspace } from '@/components/layout/entity-workspace';
import { SalesSidebar } from '@/components/layout/sales-sidebar';
import { EntityList } from '@/components/entity/entity-list';
import { EntityRequestError } from '@/components/entity/entity-request-error';
import { useApi } from '@/hooks/use-api';
import { leadApi } from '../models/lead-service';
import { cacheLead } from '../models/lead-model';

function LeadListView() {
  const vm = useLeadViewModel();
  if (vm.request.error) return <EntityRequestError title="潛在客戶" entity="leads" error={vm.request.error} retry={vm.request.reload} />;
  if (!vm.request.data || vm.request.isLoading)
    return (
      <p role="status" className="py-10 text-muted-foreground">
        載入潛在客戶…
      </p>
    );
  return <EntityList vm={vm} dataNotice={null} />;
}

function LeadDetailView({ id }: { id: string }) {
  const { data, error, execute, cancel } = useApi(leadApi.get);
  useEffect(() => {
    void execute(id)
      .then(cacheLead)
      .catch(() => {});
    return cancel;
  }, [id, execute, cancel]);
  if (error)
    return (
      <EntityRequestError title="潛在客戶" entity="leads"
        error={error}
        retry={() => {
          void execute(id)
            .then(cacheLead)
            .catch(() => {});
        }}
      />
    );
  if (!data)
    return (
      <p role="status" className="py-10 text-muted-foreground">
        載入潛在客戶資料…
      </p>
    );
  return <LeadEditView record={data} />;
}

export function LeadView({ recordId }: { recordId?: string }) {
  return (
    <EntityWorkspace sidebar={<SalesSidebar entity="leads" />}>
      {!recordId ? (
        <LeadListView />
      ) : recordId === 'new' ? (
        <LeadEditView key="new" />
      ) : (
        <LeadDetailView key={recordId} id={recordId} />
      )}
    </EntityWorkspace>
  );
}
