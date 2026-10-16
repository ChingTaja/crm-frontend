import { availableQuoteProducts, selectQuoteProduct, changeQuoteCurrency } from '../models/quote-pricing';
import { quoteCreationBlockedReason, hasQuoteAction } from '../models/quote-permissions';
import { refreshAfterForbidden } from '../models/quote-permission-recovery';
import { opportunityApi } from '@/features/opportunity/models/opportunity-service';
import { navigate } from '@/lib/router';
import { useRef, useState } from 'react';
import { quoteApi, cacheQuote, refreshQuoteAfterForbidden } from '../models/quote-service';
import { quotePayload } from '../models/quote-api';
import { useApi } from '@/hooks/use-api';
import type { ProductResponse, OpportunityResponse } from '../../../api/Api';
import type { Quote, QuoteActor, QuoteContent, QuoteLine, QuoteVersion } from '../models/quote-types';

export function useQuoteEditor(
  actor: QuoteActor | null,
  quote?: Quote,
  version?: QuoteVersion,
  initialOpportunity?: OpportunityResponse,
  onCreated?: (quote: Quote) => void
) {
  const [initial] = useState<QuoteContent>(() =>
    version
      ? structuredClone({
          currency: version.currency,
          name: version.name,
          customerId: version.customerId,
          opportunityId: version.opportunityId,
          lines: version.lines,
          paymentTerms: version.paymentTerms,
          deliveryTerms: version.deliveryTerms,
          warranty: version.warranty,
          notes: version.notes,
        })
      : {
          currency: 'TWD',
          name: '',
          customerId: initialOpportunity?.customerId ?? '',
          opportunityId: initialOpportunity?.id ?? '',
          lines: [],
          paymentTerms: '確認訂單後 30 日內付款',
          deliveryTerms: '',
          warranty: '',
          notes: '',
        }
  );
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState('');
  const latest = !quote || quote.versions[quote.versions.length - 1]?.id === version?.id;
  const parentCheck = useApi(opportunityApi.get);
  const [creationDenied, setCreationDenied] = useState(false);
  const creationBlockedReason = creationDenied
    ? '無法確認新增報價權限，請重新載入商機。'
    : quoteCreationBlockedReason(parentCheck.data ?? initialOpportunity, actor);
  const editable = quote ? hasQuoteAction(version, 'update') : !creationBlockedReason;
  const dirty = JSON.stringify(initial) !== JSON.stringify(draft);
  function update<K extends keyof QuoteContent>(field: K, value: QuoteContent[K]) {
    if (field === 'customerId' || field === 'opportunityId') return;
    setDraft((current) =>
      field === 'currency' ? changeQuoteCurrency(current, value as string) : { ...current, [field]: value }
    );
    setError('');
  }
  function updateLine<K extends keyof QuoteLine>(id: string, field: K, value: QuoteLine[K]) {
    setDraft((current) => ({
      ...current,
      lines: current.lines.map((line) => (line.id === id ? { ...line, [field]: value } : line)),
    }));
    setError('');
  }
  function selectProduct(id: string, product: Required<ProductResponse>) {
    setDraft((current) => {
      if (!availableQuoteProducts([product], current.lines, id).length) return current;
      return {
        ...current,
        lines: current.lines.map((line) => (line.id === id ? selectQuoteProduct(line, product) : line)),
      };
    });
  }
  const create = useApi(quoteApi.create),
    mutation = useApi(quoteApi.update);
  const busy = useRef(false);
  async function save() {
    if (busy.current || !editable) return;
    busy.current = true;
    setError('');
    try {
      if (!draft.opportunityId || !draft.customerId) throw new Error('報價必須隸屬商機及其客戶。');
      if (!quote) {
        const reason = quoteCreationBlockedReason(await parentCheck.execute(draft.opportunityId), actor);
        if (reason) throw new Error(reason);
      }
      const payload = quotePayload(
        draft,
        version?.lines.map((line) => line.id)
      );
      const result =
        quote && version
          ? await mutation.execute(quote.id, version.id, { ...payload, expectedRevision: version.revision })
          : await create.execute(payload);
      if (result.versions[result.versions.length - 1]?.currency !== draft.currency)
        throw new Error('後端回傳幣別與選擇不一致，請重新載入確認，勿重複新增');
      cacheQuote(result);
      if (!quote && onCreated) onCreated(result);
      else if (!quote)
        navigate(
          `/quotes/${encodeURIComponent(result.id)}/edit${initialOpportunity?.id ? `?opportunityId=${encodeURIComponent(initialOpportunity.id)}` : ''}`
        );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '無法儲存報價。');
      if (quote) await refreshQuoteAfterForbidden(cause, quote.id);
      else
        await refreshAfterForbidden(
          cause,
          async () => {
            await parentCheck.execute(draft.opportunityId);
            setCreationDenied(false);
          },
          () => setCreationDenied(true)
        );
    } finally {
      busy.current = false;
    }
  }
  return {
    draft,
    creationBlockedReason,
    isSaving: create.isLoading || mutation.isLoading || parentCheck.isLoading,
    totals: !dirty ? version?.totals : undefined,
    error,
    requestError: create.error ?? mutation.error,
    editable: editable && !create.isLoading && !mutation.isLoading && !parentCheck.isLoading,
    latest,
    dirty,
    update,
    updateLine,
    selectProduct,
    save,
    reset: () => {
      setDraft(structuredClone(initial));
      setError('');
    },
    addLine: () =>
      update('lines', [
        ...draft.lines,
        {
          id: crypto.randomUUID(),
          productId: '',
          productName: '',
          sku: '',
          catalogPrice: 0,
          quantity: 1,
          unitPrice: Number.NaN,
          discountPercent: 0,
          taxPercent: 5,
        },
      ]),
    removeLine: (id: string) =>
      update(
        'lines',
        draft.lines.filter((line) => line.id !== id)
      ),
  };
}
export type QuoteEditor = ReturnType<typeof useQuoteEditor>;
