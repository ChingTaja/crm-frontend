import { useEffect, useState, useSyncExternalStore } from 'react';
import { AppLink } from '@/components/ui/app-link';
import { canCreateOpportunityQuote } from '@/features/opportunity/models/opportunity-model';
import { opportunityApi } from '@/features/opportunity/models/opportunity-service';
import { OpportunityTabs } from '@/features/opportunity/views/opportunity-tabs';
import { EntityWorkspace } from '@/components/layout/entity-workspace';
import { SalesSidebar } from '@/components/layout/sales-sidebar';
import { Button } from '@/components/ui/button';
import { useApi } from '@/hooks/use-api';
import { quoteApi, quoteCache, cacheQuote } from '../models/quote-service';
import { useQuoteViewModel } from '../view-models/use-quote-view-model';
import { QuoteEditorView } from './quote-editor-view';
export function QuoteDetailView({ id, parentOpportunityId, embedded = false, onCreated, onDirtyChange, onSavingChange }: { id: string; parentOpportunityId?: string; embedded?: boolean; onCreated?: (quote: import('../models/quote-types').Quote) => void; onDirtyChange?: (dirty: boolean) => void; onSavingChange?: (saving: boolean) => void }) {
  const vm = useQuoteViewModel();
  const opportunityId = parentOpportunityId ?? (new URLSearchParams(window.location.search).get('opportunityId') || undefined);
  const opportunityRequest = useApi(opportunityApi.get);
  const { execute: loadOpportunity, cancel: cancelOpportunity } = opportunityRequest;
  useEffect(() => { if (id === 'new' && opportunityId) void loadOpportunity(opportunityId).catch(() => {}); return cancelOpportunity; }, [id, opportunityId, loadOpportunity, cancelOpportunity]);
  const [selected, setSelected] = useState('');
  const records = useSyncExternalStore(quoteCache.subscribe, quoteCache.getSnapshot);
  const { data, error, execute, cancel, isLoading } = useApi(quoteApi.get);
  useEffect(() => { if (id !== 'new') void execute(id).then(cacheQuote).catch(() => {}); return cancel; }, [id, execute, cancel]);
  if (error) return <div role="alert" className="py-8">{error.message}<Button onClick={() => { void execute(id).then(cacheQuote).catch(() => {}); }}>重新載入</Button></div>;
  if (id !== 'new' && (!data || isLoading)) return <p role="status" className="py-8">載入報價資料…</p>;
  if (id === 'new' && opportunityId && opportunityRequest.error) return <div role="alert" className="py-8">無法載入來源商機：{opportunityRequest.error.message}<Button onClick={() => { void loadOpportunity(opportunityId).catch(() => {}); }}>重試</Button></div>;
  if (id === 'new' && opportunityId && !opportunityRequest.data) return <p role="status" className="py-8">載入來源商機…</p>;
  if (id === 'new' && !canCreateOpportunityQuote(opportunityRequest.data)) return <div className="space-y-4 py-8"><p role="alert" className="rounded-xl border bg-muted/30 p-5">此商機目前無法新增報價。已結案商機不能再建立報價單。</p>{opportunityId && <AppLink className="text-sm underline" href={`/opportunities/${encodeURIComponent(opportunityId)}/edit?tab=quotes`}>返回商機報價分頁</AppLink>}</div>;
  const quote = id === 'new' ? undefined : records.find(q => q.id === id) ?? data;
  const parentId = quote ? quote.versions[quote.versions.length - 1]?.opportunityId : opportunityId;
  const version = quote?.versions.find(v => v.id === selected) ?? quote?.versions[quote.versions.length - 1];
  if (quote && parentOpportunityId && parentId !== parentOpportunityId) return <p role="alert" className="py-8 text-destructive">此報價不屬於目前商機，無法顯示。</p>;
  return <>{parentId && !embedded && <OpportunityTabs recordId={parentId} quotes />}<div className="flex justify-end pt-3">{id !== 'new' && <Button variant="outline" onClick={() => { if (window.confirm('重新載入將捨棄尚未儲存的修改，是否繼續？')) void execute(id).then(cacheQuote).catch(() => {}); }}>重新載入</Button>}</div><QuoteEditorView key={`${id}-${version?.id}-${version?.revision}`} vm={vm} quote={quote} version={version} onVersion={setSelected} onCreated={onCreated} onDirtyChange={onDirtyChange} onSavingChange={onSavingChange} embedded={embedded} initialOpportunity={id === 'new' ? opportunityRequest.data : undefined} backHref={parentId ? `/opportunities/${encodeURIComponent(parentId)}/edit?tab=quotes` : '/opportunities'} /></>;
}
export function QuoteView({ recordId }: { recordId?: string }) {
  const opportunityId = new URLSearchParams(window.location.search).get('opportunityId');
  const needsParent = !recordId || (recordId === 'new' && !opportunityId);
  return <EntityWorkspace sidebar={<SalesSidebar entity="opportunities" />}>
    {needsParent ? <div className="mx-auto my-10 max-w-xl rounded-2xl border bg-muted/20 p-8"><h1 className="text-xl font-semibold">從商機建立報價單</h1><p className="mt-3 text-sm leading-relaxed text-muted-foreground">請先開啟一筆商機，在詳細頁面的「報價單」分頁查看或新增報價。</p><AppLink href="/opportunities" className="mt-5 inline-block text-sm font-medium underline">前往商機列表</AppLink></div> : <QuoteDetailView key={`${recordId}-${opportunityId ?? ''}`} id={recordId!} />}
  </EntityWorkspace>;
}
