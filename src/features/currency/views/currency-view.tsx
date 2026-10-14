import { useEffect } from 'react';
import { EntityWorkspace } from '@/components/layout/entity-workspace';
import { SalesSidebar } from '@/components/layout/sales-sidebar';
import { EntityList } from '@/components/entity/entity-list';
import { EntityRequestError } from '@/components/entity/entity-request-error';
import { useApi } from '@/hooks/use-api';
import { currencyApi } from '../models/currency-service';
import { useCurrencyViewModel } from '../view-models/use-currency-view-model';
import { CurrencyEditView } from './currency-edit-view';

function CurrencyListView() {
  const vm = useCurrencyViewModel();
  if (vm.request.error && !vm.request.data) return <EntityRequestError title="幣別" entity="currencies" error={vm.request.error} retry={vm.request.reload} />;
  if (!vm.request.data) return <p role="status" className="py-10 text-muted-foreground">載入幣別…</p>;
  return <>{vm.request.error && <p role="alert" className="py-3 text-destructive">{vm.request.error.message}</p>}<EntityList vm={vm} /></>;
}

function CurrencyDetailView({ code }: { code: string }) {
  const { data, error, execute, cancel } = useApi(currencyApi.get);
  useEffect(() => {
    void execute(code).catch(() => {});
    return cancel;
  }, [code, execute, cancel]);
  if (error) return <EntityRequestError title="幣別" entity="currencies" error={error} retry={() => { void execute(code).catch(() => {}); }} />;
  if (!data) return <p role="status" className="py-10 text-muted-foreground">載入幣別資料…</p>;
  return <CurrencyEditView key={JSON.stringify(data)} record={data} />;
}

export function CurrencyView({ recordId }: { recordId?: string }) {
  return <EntityWorkspace sidebar={<SalesSidebar entity="currencies" />}>
    {!recordId ? <CurrencyListView /> : recordId === 'new' ? <CurrencyEditView key="new" /> : <CurrencyDetailView key={recordId} code={recordId} />}
  </EntityWorkspace>;
}
