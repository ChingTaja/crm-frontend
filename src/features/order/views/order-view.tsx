import { AppLink } from '@/components/ui/app-link';
import { useOrderViewModel } from '../view-models/use-order-view-model';
import { OrderEditView } from './order-edit-view';
import { EntityWorkspace } from '@/components/layout/entity-workspace';
import { SalesSidebar } from '@/components/layout/sales-sidebar';
import { EntityList } from '@/components/entity/entity-list';
import { QuoteOrderView } from './quote-order-view';

export function OrderView({ recordId }: { recordId?: string }) {
  const vm = useOrderViewModel();
  const record = vm.records.find((item) => item.id === recordId);
  return (
    <EntityWorkspace sidebar={<SalesSidebar entity="orders" />}>
      {recordId ? (
        recordId === 'new' ? (
          <p className="py-10">
            訂單由已接受的報價單轉換建立。
            <AppLink className="ml-2 underline" href="/quotes">前往報價單</AppLink>
          </p>
        ) : record?.quoteSource ? (
          <QuoteOrderView order={record} />
        ) : record ? (
          <OrderEditView key={recordId} record={record} />
        ) : (
          <p className="py-10">
            找不到資料。
            <AppLink className="underline" href="/orders">
              返回列表
            </AppLink>
          </p>
        )
      ) : (
        <>
          <p className="py-3 text-sm text-muted-foreground">
            訂單由已接受的報價單轉換建立。
            <AppLink className="ml-2 underline" href="/quotes">前往報價單</AppLink>
          </p>
          <EntityList vm={vm} allowCreate={false} />
        </>
      )}
    </EntityWorkspace>
  );
}
