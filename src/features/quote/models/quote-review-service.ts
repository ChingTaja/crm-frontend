import { createGeneratedApi } from '../../../api/client';
import type { ReviewQuoteRequest } from '../../../api/Api';
import { unwrapResponse } from '../../../lib/api-operations';
import { quoteRecord } from './quote-api';
import type { RequestQuoteReview } from './quote-review-contract';
const client = createGeneratedApi(import.meta.env.VITE_API_BASE_URL || '/api');
export const quoteReviewApi = {
  async reviewers(signal: AbortSignal, id: string, keyword: string) {
    const data = await unwrapResponse(
      client.api.reviewerOptions(encodeURIComponent(id), { keyword: keyword.trim() }, { signal })
    );
    if (!Array.isArray(data) || data.some((item) => !item.id || !item.username))
      throw new Error('審核人選項格式不正確。');
    return data;
  },
  async request(signal: AbortSignal, id: string, versionId: string, body: RequestQuoteReview) {
    const data = await unwrapResponse(
      client.api.requestApproval(encodeURIComponent(id), encodeURIComponent(versionId), body, {
        signal,
        format: 'json',
      })
    );
    const result = quoteRecord(data);
    const version = result.versions.find((v) => v.id === versionId);
    if (version?.reviewerId !== body.reviewerId || version.approval !== 'Pending')
      throw new Error('後端未確認指定審核人，請重新載入確認送審結果。');
    return result;
  },
  async list(signal: AbortSignal, query: { page: number; size: number }) {
    const data = await unwrapResponse(client.api.findMyQuoteReviews(query, { signal }));
    if (!Array.isArray(data.content) || !Number.isInteger(data.totalPages)) throw new Error('待審核列表格式不正確。');
    return data;
  },
  async review(signal: AbortSignal, id: string, versionId: string, body: ReviewQuoteRequest) {
    return quoteRecord(
      await unwrapResponse(
        client.api.review(encodeURIComponent(id), encodeURIComponent(versionId), body, { signal, format: 'json' })
      )
    );
  },
  async get(signal: AbortSignal, id: string) {
    return quoteRecord(await unwrapResponse(client.api.findMyQuoteReview(encodeURIComponent(id), { signal })));
  },
};
