import { useEffect } from 'react';
import { useOpportunityViewModel } from '../view-models/use-opportunity-view-model';
import { OpportunityEditView } from './opportunity-edit-view';
import { EntityWorkspace } from '@/components/layout/entity-workspace';
import { SalesSidebar } from '@/components/layout/sales-sidebar';
import { EntityList } from '@/components/entity/entity-list';
import { EntityRequestError } from '@/components/entity/entity-request-error';
import { useApi } from '@/hooks/use-api';
import { opportunityApi } from '../models/opportunity-service';
import { cacheOpportunity } from '../models/opportunity-model';

function OpportunityListView() {
  const vm = useOpportunityViewModel();
  if (vm.request.error)
    return (
      <EntityRequestError title="商機" entity="opportunities" error={vm.request.error} retry={vm.request.reload} />
    );
  if (!vm.request.data || vm.request.isLoading)
    return (
      <p role="status" className="py-10 text-muted-foreground">
        載入商機…
      </p>
    );
  return <EntityList vm={vm} dataNotice={null} />;
}

function OpportunityDetailView({ id }: { id: string }) {
  const { data, error, execute, cancel } = useApi(opportunityApi.get);
  useEffect(() => {
    void execute(id)
      .then(cacheOpportunity)
      .catch(() => {});
    return cancel;
  }, [id, execute, cancel]);
  if (error)
    return (
      <EntityRequestError
        title="商機"
        entity="opportunities"
        error={error}
        retry={() => {
          void execute(id)
            .then(cacheOpportunity)
            .catch(() => {});
        }}
      />
    );
  if (!data)
    return (
      <p role="status" className="py-10 text-muted-foreground">
        載入商機資料…
      </p>
    );
  return <OpportunityEditView record={data} />;
}

export function OpportunityView({ recordId }: { recordId?: string }) {
  return (
    <EntityWorkspace sidebar={<SalesSidebar entity="opportunities" />}>
      {!recordId ? (
        <OpportunityListView />
      ) : recordId === 'new' ? (
        <OpportunityEditView key="new" />
      ) : (
        <OpportunityDetailView key={recordId} id={recordId} />
      )}
    </EntityWorkspace>
  );
}
