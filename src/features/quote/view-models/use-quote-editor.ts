import { canCreateOpportunityQuote } from '@/features/opportunity/models/opportunity-model';
import { opportunityApi } from '@/features/opportunity/models/opportunity-service';
import { useAccess } from '@/features/access/view-models/use-access';
import { navigate } from '@/lib/router';
import { useRef, useState } from 'react';
import { quoteApi, cacheQuote } from '../models/quote-service';
import { quotePayload } from '../models/quote-api';
import { useApi } from '@/hooks/use-api';
import { canEditQuote, canManageQuote, quoteToday } from '../models/quote-policy';
import type { ProductResponse, OpportunityResponse } from '../../../api/Api';
import type { Quote, QuoteActor, QuoteContent, QuoteLine, QuoteVersion } from '../models/quote-types';

export function useQuoteEditor(actor: QuoteActor | null, quote?: Quote, version?: QuoteVersion, initialOpportunity?: OpportunityResponse, onCreated?: (quote: Quote) => void) {
  const { can } = useAccess();
  const [initial] = useState<QuoteContent>(() =>
    version
      ? structuredClone({
          name: version.name,
          customerId: version.customerId,
          opportunityId: version.opportunityId,
          validUntil: version.validUntil,
          lines: version.lines,
          paymentTerms: version.paymentTerms,
          deliveryTerms: version.deliveryTerms,
          warranty: version.warranty,
          notes: version.notes,
        })
      : {
          name: '',
          customerId: initialOpportunity?.customerId ?? '',
          opportunityId: initialOpportunity?.id ?? '',
          validUntil: quoteToday(new Date(Date.now() + 30 * 86400000)),
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
  const editable = (quote ? !!version?.opportunityId : canCreateOpportunityQuote(initialOpportunity)) && can(quote ? 'quotes.update' : 'quotes.create') && canManageQuote(actor) && latest && (!version || canEditQuote(version));
  const dirty = JSON.stringify(initial) !== JSON.stringify(draft);
  function update<K extends keyof QuoteContent>(field: K, value: QuoteContent[K]) {
    if (field === 'customerId' || field === 'opportunityId') return;
    setDraft((current) => ({ ...current, [field]: value, ...(field === 'customerId' ? { opportunityId: '' } : {}) }));
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
    setDraft((current) => ({
      ...current,
      lines: current.lines.map((line) =>
        line.id === id && line.productId !== product.id
          ? {
              ...line,
              productId: product.id,
              productName: product.name,
              sku: product.sku,
              catalogPrice: product.price,
              unitPrice: product.price,
            }
          : line
      ),
    }));
  }
  const create = useApi(quoteApi.create), mutation = useApi(quoteApi.update);
  const parentCheck = useApi(opportunityApi.get);
  const busy = useRef(false);
  async function save() {
    if (busy.current || !editable) return;
    busy.current = true; setError('');
    try {
      if (!draft.opportunityId || !draft.customerId) throw new Error('報價必須隸屬商機及其客戶。');
      if (!quote && !canCreateOpportunityQuote(await parentCheck.execute(draft.opportunityId))) throw new Error('商機已結案或狀態已變更，無法新增報價單。');
      const payload = quotePayload(draft, version?.lines.map(line => line.id));
      const result = quote && version ? await mutation.execute(quote.id, version.id, { ...payload, expectedRevision: version.revision }) : await create.execute(payload);
      cacheQuote(result);
      if (!quote && onCreated) onCreated(result);
      else if (!quote) navigate(`/quotes/${encodeURIComponent(result.id)}/edit${initialOpportunity?.id ? `?opportunityId=${encodeURIComponent(initialOpportunity.id)}` : ''}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : '無法儲存報價。'); }
    finally { busy.current = false; }
  }
  return {
    draft,
    isSaving: create.isLoading || mutation.isLoading || parentCheck.isLoading,
    totals: !dirty ? version?.totals : undefined,
    error,
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
          unitPrice: 0,
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
