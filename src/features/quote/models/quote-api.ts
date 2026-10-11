import type { AssignedQuoteResponse } from './quote-review-contract';
import type {
  Api,
  CreateQuoteRequest,
  UpdateQuoteRequest,
  QuoteActionRequest,
  ReviewQuoteRequest,
  DecideQuoteRequest,
} from '../../../api/Api';
import type { Quote, QuoteContent } from './quote-types';
import { unwrapResponse } from '../../../lib/api-operations';

// Normalize optional generated response fields for the existing editor.
export function quoteRecord(data: AssignedQuoteResponse): Quote {
  if (!data?.id || !data.number || !data.versions?.length) throw new Error('報價單回傳格式不正確。');
  return {
    id: data.id,
    number: data.number,
    orderId: data.orderId,
    versions: data.versions
      .map((v) => {
        if (!v.id || !v.status || !v.approval || !v.version || !v.revision || !Array.isArray(v.lines))
          throw new Error('報價版本回傳格式不正確。');
        return {
          ...v,
          id: v.id,
          version: v.version,
          revision: v.revision,
          status: v.status,
          approval: v.approval,
          name: v.name ?? '',
          customerId: v.customerId ?? '',
          opportunityId: v.opportunityId ?? '',
          paymentTerms: v.paymentTerms ?? '',
          deliveryTerms: v.deliveryTerms ?? '',
          warranty: v.warranty ?? '',
          notes: v.notes ?? '',
          createdAt: v.createdAt ?? '',
          lines: v.lines.map((line) => {
            if (!line.id || !line.productId || line.quantity == null || line.unitPrice == null)
              throw new Error('報價明細回傳格式不正確。');
            return {
              ...line,
              id: line.id,
              productId: line.productId,
              productName: line.productName ?? '',
              sku: line.sku ?? '',
              catalogPrice: line.catalogPrice ?? 0,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              discountPercent: line.discountPercent ?? 0,
              taxPercent: line.taxPercent ?? 0,
            };
          }),
        };
      })
      .sort((a, b) => a.version - b.version),
    audit: (data.audit ?? []).map((a) => ({
      ...a,
      id: a.id ?? '',
      at: a.at ?? '',
      action: a.action ?? '',
      version: a.version ?? 0,
      detail: a.detail ?? '',
    })),
  };
}
export function quotePayload(content: QuoteContent, existingLineIds: string[] = []): CreateQuoteRequest {
  if (!content.customerId.trim() || !content.opportunityId.trim() || content.lines.some(line => !line.productId.trim()))
    throw new Error('請選擇有效的客戶、商機與產品。');
  return {
    name: content.name.trim(),
    customerId: content.customerId,
    opportunityId: content.opportunityId.trim(),
    paymentTerms: content.paymentTerms,
    deliveryTerms: content.deliveryTerms,
    warranty: content.warranty,
    notes: content.notes,
    lines: content.lines.map((l) => ({
      ...(existingLineIds.includes(l.id) ? { id: l.id } : {}),
      productId: l.productId,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      discountPercent: l.discountPercent,
      taxPercent: l.taxPercent,
    })),
  };
}
export function createQuoteApi(client: Api<unknown>['api']) {
  const params = (signal: AbortSignal) => ({ signal, format: 'json' as const });
  const action =
    (name: 'send' | 'newVersion') =>
    async (signal: AbortSignal, id: string, versionId: string, body: QuoteActionRequest) =>
      quoteRecord(
        await unwrapResponse(client[name](encodeURIComponent(id), encodeURIComponent(versionId), body, params(signal)))
      );
  return {
    async list(signal: AbortSignal, query: Parameters<typeof client.findAllQuotes>[0]) {
      const data = await unwrapResponse(client.findAllQuotes(query, params(signal)));
      if (!Array.isArray(data?.content) || !Number.isInteger(data.totalElements) || !Number.isInteger(data.totalPages))
        throw new Error('報價列表回傳格式不正確。');
      if (query?.opportunityId && data.content.some((record) => record.opportunityId !== query.opportunityId))
        throw new Error('無法確認報價所屬商機，請重新載入；若問題持續，請聯絡管理員。');
      return data;
    },
    get: async (signal: AbortSignal, id: string) =>
      quoteRecord(await unwrapResponse(client.findByIdQuote(encodeURIComponent(id), params(signal)))),
    create: async (signal: AbortSignal, body: CreateQuoteRequest) =>
      quoteRecord(await unwrapResponse(client.createQuotes(body, params(signal)))),
    update: async (
      signal: AbortSignal,
      id: string,
      versionId: string,
      body: UpdateQuoteRequest
    ) =>
      quoteRecord(
        await unwrapResponse(
          client.updateQuotes(encodeURIComponent(id), encodeURIComponent(versionId), body, params(signal))
        )
      ),
    send: action('send'),
    requestApproval: async (
      signal: AbortSignal,
      id: string,
      versionId: string,
      body: import('../../../api/Api').RequestQuoteApprovalRequest
    ) =>
      quoteRecord(
        await unwrapResponse(
          client.requestApproval(encodeURIComponent(id), encodeURIComponent(versionId), body, params(signal))
        )
      ),
    newVersion: action('newVersion'),
    review: async (signal: AbortSignal, id: string, versionId: string, body: ReviewQuoteRequest) =>
      quoteRecord(
        await unwrapResponse(client.review(encodeURIComponent(id), encodeURIComponent(versionId), body, params(signal)))
      ),
    decision: async (signal: AbortSignal, id: string, versionId: string, body: DecideQuoteRequest) =>
      quoteRecord(
        await unwrapResponse(
          client.decision(encodeURIComponent(id), encodeURIComponent(versionId), body, params(signal))
        )
      ),
    async removeMany(signal: AbortSignal, ids: string[]) {
      const uniqueIds = [...new Set(ids)];
      if (!uniqueIds.length) return { deleted: [], failed: [] };
      await client.deleteQuotesBatch({ ids: uniqueIds }, { signal });
      return { deleted: uniqueIds, failed: [] };
    },
  };
}
