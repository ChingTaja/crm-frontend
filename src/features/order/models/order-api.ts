import type { Api, OrderResponse, UpdateOrderStatusRequest, QuoteActionRequest } from '../../../api/Api';
import { unwrapResponse } from '../../../lib/api-operations';
export type OrderQuery = NonNullable<Parameters<Api<unknown>['api']['findAllOrders']>[0]>;
export const orderStatusLabels: Record<UpdateOrderStatusRequest['status'], string> = {
  Confirmed: '已確認', Processing: '處理中', Completed: '已完成', Cancelled: '已取消',
};
function detail(data: OrderResponse) {
  if (!data?.id || !Number.isInteger(data.revision) || !Array.isArray(data.lines) || !data.totals || !Array.isArray(data.allowedTransitions)) throw new Error('訂單資料格式不正確。');
  return data;
}
export function createOrderApi(client: Api<unknown>['api']) {
  return {
    async list(signal: AbortSignal, query: OrderQuery) {
      const data = await unwrapResponse(client.findAllOrders(query, { signal, format: 'json' }));
      if (!Array.isArray(data?.content) || !Number.isInteger(data.totalElements) || !Number.isInteger(data.totalPages)) throw new Error('訂單列表格式不正確。');
      return data;
    },
    async get(signal: AbortSignal, id: string) {
      return detail(await unwrapResponse(client.findByIdOrder(encodeURIComponent(id), { signal, format: 'json' })));
    },
    async updateStatus(signal: AbortSignal, id: string, body: UpdateOrderStatusRequest) {
      return detail(await unwrapResponse(client.updateOrderStatus(encodeURIComponent(id), body, { signal, format: 'json' })));
    },
    async convert(signal: AbortSignal, id: string, versionId: string, body: QuoteActionRequest) {
      const data = await unwrapResponse(client.convertToOrder(encodeURIComponent(id), encodeURIComponent(versionId), body, { signal, format: 'json' }));
      if (!data?.orderId) throw new Error('轉單回傳缺少訂單編號。');
      return data;
    },
  };
}
