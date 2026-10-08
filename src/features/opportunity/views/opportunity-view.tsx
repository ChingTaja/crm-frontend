import { useEffect, useState } from 'react';
import { useAccess } from '@/features/access/view-models/use-access';
import { OpportunityQuotesView } from './opportunity-quotes-view';
import { OpportunityTabs } from './opportunity-tabs';
import type { OpportunityResponse } from '../../../api/Api';
import { useOpportunityViewModel } from '../view-models/use-opportunity-view-model';
import { OpportunityEditView } from './opportunity-edit-view';
import { EntityWorkspace } from '@/components/layout/entity-workspace';
import { SalesSidebar } from '@/components/layout/sales-sidebar';
import { EntityList } from '@/components/entity/entity-list';
import { EntityRequestError } from '@/components/entity/entity-request-error';
import { useApi } from '@/hooks/use-api';
import { opportunityApi } from '../models/opportunity-service';
import { canCreateOpportunityQuote, opportunityOutcome, cacheOpportunity } from '../models/opportunity-model';

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
  const { can } = useAccess();
  const [closed, setClosed] = useState<OpportunityResponse>();
  const quotes = new URLSearchParams(window.location.search).get('tab') === 'quotes';
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
  return <><OpportunityTabs recordId={id} quotes={quotes} />{quotes ? can('quotes.read') ? <OpportunityQuotesView key={id} opportunityId={id} opportunityName={(closed ?? data).name} allowCreate={canCreateOpportunityQuote(closed ?? data)} allowDelete={opportunityOutcome((closed ?? data).stage) !== 'won'} /> : <p role="alert" className="py-8">沒有報價單的存取權限。</p> : <OpportunityEditView key={`${id}-${closed?.stage ?? data.stage}`} record={closed ?? data} onClosed={setClosed} />}</>;
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
