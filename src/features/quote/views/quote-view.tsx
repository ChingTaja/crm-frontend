import { useEffect, useState, useSyncExternalStore } from 'react';
import { EntityWorkspace } from '@/components/layout/entity-workspace';
import { SalesSidebar } from '@/components/layout/sales-sidebar';
import { EntityList } from '@/components/entity/entity-list';
import { Button } from '@/components/ui/button';
import { useApi } from '@/hooks/use-api';
import { useEntityList } from '@/hooks/use-entity-list';
import { useEntityFields } from '@/hooks/use-entity-fields';
import { usePaginatedQuery } from '@/hooks/use-paginated-query';
import { metadataRows } from '@/lib/entity-fields';
import { quoteApi, quoteCache, cacheQuote } from '../models/quote-service';
import { useQuoteViewModel } from '../view-models/use-quote-view-model';
import { money } from '../models/quote-policy';
import { QuoteEditorView } from './quote-editor-view';
function QuoteListView() {
  const query = usePaginatedQuery(quoteApi.list);
  const metadata = useEntityFields('quotes');
  const deletion = useApi(quoteApi.removeMany);
  const rows = metadataRows(query.records, metadata.fields).map(row => ({ ...row, displayValues: row.displayValues.map((value, index) => metadata.fields[index].apiFieldName === 'totalCents' && value !== '' ? money(Number(value)) : value) }));
  const vm = useEntityList('quotes', '報價單', metadata.fields, rows, async ids => {
    const result = await deletion.execute(ids);
    quoteCache.removeMany(result.deleted);
    await query.reload();
    if (result.failed.length) throw new Error(result.failed.map(f => f.message).join('；'));
  }, true, query.pagination);
  const error = query.error ?? metadata.error;
  if (error) return <div role="alert" className="py-8">無法載入報價單：{error.message}<Button onClick={() => { void Promise.all([query.reload(), metadata.reload()]).catch(() => {}); }}>重試</Button></div>;
  if (!query.data || !metadata.data || query.isLoading || metadata.isLoading) return <p role="status" className="py-8">載入報價單…</p>;
  return <EntityList vm={vm} dataNotice={null} />;
}
function QuoteDetailView({ id }: { id: string }) {
  const vm = useQuoteViewModel();
  const [selected, setSelected] = useState('');
  const records = useSyncExternalStore(quoteCache.subscribe, quoteCache.getSnapshot);
  const { data, error, execute, cancel, isLoading } = useApi(quoteApi.get);
  useEffect(() => { if (id !== 'new') void execute(id).then(cacheQuote).catch(() => {}); return cancel; }, [id, execute, cancel]);
  if (error) return <div role="alert" className="py-8">{error.message}<Button onClick={() => { void execute(id).then(cacheQuote).catch(() => {}); }}>重新載入</Button></div>;
  if (id !== 'new' && (!data || isLoading)) return <p role="status" className="py-8">載入報價資料…</p>;
  const quote = id === 'new' ? undefined : records.find(q => q.id === id) ?? data;
  const version = quote?.versions.find(v => v.id === selected) ?? quote?.versions[quote.versions.length - 1];
  return <><div className="flex justify-end pt-3">{id !== 'new' && <Button variant="outline" onClick={() => { if (window.confirm('重新載入將捨棄尚未儲存的修改，是否繼續？')) void execute(id).then(cacheQuote).catch(() => {}); }}>重新載入</Button>}</div><QuoteEditorView key={`${id}-${version?.id}-${version?.revision}`} vm={vm} quote={quote} version={version} onVersion={setSelected} /></>;
}
export function QuoteView({ recordId }: { recordId?: string }) {
  return <EntityWorkspace sidebar={<SalesSidebar entity="quotes" />}>{recordId ? <QuoteDetailView key={recordId} id={recordId} /> : <QuoteListView />}</EntityWorkspace>;
}
