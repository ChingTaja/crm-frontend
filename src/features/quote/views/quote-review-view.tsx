import { useEffect, useSyncExternalStore } from 'react';
import { useApi } from '@/hooks/use-api';
import { usePaginatedQuery } from '@/hooks/use-paginated-query';
import { useAccess } from '@/features/access/view-models/use-access';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { quoteReviewApi } from '../models/quote-review-service';
import { quoteCache, cacheQuote } from '../models/quote-service';
import { QuoteActions } from '../components/quote-actions';
import { money } from '../models/quote-policy';

function ReviewList() {
  const query = usePaginatedQuery(quoteReviewApi.list);
  return <><h1 className="text-xl font-semibold">待我審核</h1>{query.error && <p role="alert">{query.error.message}<Button onClick={() => { void query.reload().catch(() => {}); }}>重試</Button></p>}{query.isLoading && <p role="status">載入中…</p>}
    <div className="divide-y rounded-xl border">{query.records.map(q => <AppLink key={q.id} href={`/quote-reviews/${encodeURIComponent(q.id ?? '')}/edit`} className="flex justify-between gap-4 p-4 hover:bg-muted"><span>{q.number} · {q.name}</span><span>查看並審核</span></AppLink>)}</div>
    {!query.isLoading && !query.error && !query.records.length && <p>目前沒有待審核報價。</p>}
    <Pagination page={query.pagination.page} pageCount={query.pagination.pageCount} onPageChange={query.pagination.setPage} /></>;
}
function ReviewDetail({ id }: { id: string }) {
  const { me } = useAccess();
  const { execute, cancel, data, error, isLoading } = useApi(quoteReviewApi.get);
  const records = useSyncExternalStore(quoteCache.subscribe, quoteCache.getSnapshot);
  useEffect(() => { void execute(id).then(cacheQuote).catch(() => {}); return cancel; }, [id, execute, cancel]);
  const quote = records.find(q => q.id === id) ?? data;
  if (error) return <p role="alert">{error.message}<Button onClick={() => { void execute(id).then(cacheQuote).catch(() => {}); }}>重新載入</Button></p>;
  if (!data || !quote || isLoading) return <p role="status">載入報價…</p>;
  const version = quote.versions[quote.versions.length - 1];
  return <><AppLink href="/quote-reviews" className="underline">返回待我審核</AppLink><h1 className="text-xl font-semibold">{quote.number} · {version.name}</h1><p>版本 {version.version} · 審核狀態：{version.approval} · 有效期限：{version.validUntil}</p>
    <QuoteActions reviewOnly quote={quote} version={version} actor={me ? { id: me.id, name: me.username, role: 'system', permissionCodes: me.permissionCodes } : null} dirty={false} />
    <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{['商品','SKU','數量','單價','折扣','稅率'].map(label => <th className="p-3" key={label}>{label}</th>)}</tr></thead><tbody>{version.lines.map(line => <tr className="border-t" key={line.id}>{[line.productName,line.sku,line.quantity,money(line.unitPrice * 100),`${line.discountPercent}%`,`${line.taxPercent}%`].map((value,index) => <td key={index} className="p-3">{value}</td>)}</tr>)}</tbody></table></div>
    <p className="text-right font-semibold">含稅總額：{version.totals?.totalCents == null ? '—' : money(version.totals.totalCents)}</p>
    {[['付款條件',version.paymentTerms],['交貨條件',version.deliveryTerms],['保固',version.warranty],['備註',version.notes],['審核意見',version.approvalReason]].map(([label,value]) => <div key={label}><h2 className="font-semibold">{label}</h2><p className="whitespace-pre-wrap">{value || '—'}</p></div>)}
  </>;
}
export function QuoteReviewView({ recordId }: { recordId?: string }) { return <main className="mx-auto w-full max-w-5xl space-y-5 px-6 py-8">{recordId ? <ReviewDetail key={recordId} id={recordId} /> : <ReviewList />}</main>; }
