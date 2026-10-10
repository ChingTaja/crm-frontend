import { useEffect, useSyncExternalStore } from 'react';
import { useProductViewModel } from '../view-models/use-product-view-model';
import { ProductEditView } from './product-edit-view';
import { EntityWorkspace } from '@/components/layout/entity-workspace';
import { SalesSidebar } from '@/components/layout/sales-sidebar';
import { EntityList } from '@/components/entity/entity-list';
import { EntityRequestError } from '@/components/entity/entity-request-error';
import { useApi } from '@/hooks/use-api';
import { productApi } from '../models/product-service';
import { cacheProduct, productRepository } from '../models/product-model';

function ProductListView() {
  const vm = useProductViewModel();
  if (vm.request.error && !vm.request.data)
    return <EntityRequestError title="產品" entity="products" error={vm.request.error} retry={vm.request.reload} />;
  if (!vm.request.data)
    return (
      <p role="status" className="py-10 text-muted-foreground">
        載入產品…
      </p>
    );
  return <>{vm.request.error && <p role="alert" className="py-3 text-destructive">{vm.request.error.message}</p>}<EntityList vm={vm} dataNotice={null} /></>;
}

function ProductDetailView({ id }: { id: string }) {
  const { data, error, execute, cancel } = useApi(productApi.get);
  const records = useSyncExternalStore(productRepository.subscribe, productRepository.getSnapshot);
  useEffect(() => {
    void execute(id)
      .then(cacheProduct)
      .catch(() => {});
    return cancel;
  }, [id, execute, cancel]);
  if (error)
    return (
      <EntityRequestError
        title="產品"
        entity="products"
        error={error}
        retry={() => {
          void execute(id)
            .then(cacheProduct)
            .catch(() => {});
        }}
      />
    );
  if (!data)
    return (
      <p role="status" className="py-10 text-muted-foreground">
        載入產品資料…
      </p>
    );
  const record = records.find((item) => item.id === id) ?? data;
  return <ProductEditView key={JSON.stringify(record)} record={record} />;
}

export function ProductView({ recordId }: { recordId?: string }) {
  return (
    <EntityWorkspace sidebar={<SalesSidebar entity="products" />}>
      {!recordId ? (
        <ProductListView />
      ) : recordId === 'new' ? (
        <ProductEditView key="new" />
      ) : (
        <ProductDetailView key={recordId} id={recordId} />
      )}
    </EntityWorkspace>
  );
}
