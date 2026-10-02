import type { Order } from '../models/order-model';
import { QuoteOrderView } from './quote-order-view';

export function OrderEditView({ record }: { record: Order }) {
  return <QuoteOrderView order={record} />;
}
