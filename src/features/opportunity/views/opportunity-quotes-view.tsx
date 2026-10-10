import { useCallback, useEffect, useState } from 'react';
import { useAccess } from '@/features/access/view-models/use-access';
import { quoteApi, quoteCache } from '@/features/quote/models/quote-service';
import type { Quote } from '@/features/quote/models/quote-types';
import { QuoteDetailView } from '@/features/quote/views/quote-view';
import { DeleteRecordsButton } from '@/components/entity/delete-records-button';
import { Button } from '@/components/ui/button';
import { useApi } from '@/hooks/use-api';
import { collectPages } from '@/lib/api-pagination';
import { opportunityApi } from '../models/opportunity-service';
import { opportunityOutcome } from '../models/opportunity-model';

export function OpportunityQuotesView({ opportunityId, opportunityName, allowCreate, allowDelete }: { opportunityId: string; opportunityName?: string; allowCreate: boolean; allowDelete: boolean }) {
  const { can } = useAccess();
  const request = useCallback((signal: AbortSignal) => collectPages(signal, (signal, page) => quoteApi.list(signal, { ...page, opportunityId })), [opportunityId]);
  const { data, error, execute, cancel } = useApi(request);
  const parentCheck = useApi(opportunityApi.get);
  const deletion = useApi(quoteApi.removeMany);
  const [selected, setSelected] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => { void execute().catch(() => {}); return cancel; }, [execute, cancel]);
  const records = data ?? [];
  const currentId = selected || records[0]?.id || (allowCreate && can('quotes.create') ? 'new' : '');
  const current = records.find(record => record.id === currentId);
  function switchQuote(id: string) {
    if (saving || deletion.isLoading) return;
    if (dirty && !window.confirm('切換報價將捨棄尚未儲存的修改，是否繼續？')) return;
    setDirty(false);
    setSelected(id);
  }
  function created(quote: Quote) {
    setDirty(false);
    setSelected(quote.id);
    void execute().catch(() => {});
  }
  async function remove() {
    if (!allowDelete || !current?.id) return;
    const parent = await parentCheck.execute(opportunityId);
    if (opportunityOutcome(parent.stage) === 'won') throw new Error('商機已需求成交，無法刪除報價單。');
    let result;
    try {
      result = await deletion.execute([current.id]);
    } catch (error) {
      await execute().catch(() => {});
      throw error;
    }
    quoteCache.removeMany(result.deleted);
    setSelected('');
    setDirty(false);
    await execute();
  }
  if (error && !data) return <div role="alert" className="space-y-3 py-8"><p>無法載入商機報價：{error.message}</p><Button variant="outline" onClick={() => { void execute().catch(() => {}); }}>重試</Button></div>;
  if (!data) return <p role="status" className="py-8 text-muted-foreground">載入商機報價…</p>;
  return <div>
    {error && <p role="alert">無法重新載入商機報價：{error.message}</p>}
    <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-muted/20 p-4">
      <div className="space-y-2"><p className="text-xs text-muted-foreground">「{opportunityName || '此商機'}」的報價單</p>{records.length > 0 && <label className="flex items-center gap-2 text-sm">報價單<select aria-label="切換此商機的報價單" className="max-w-full rounded-lg border bg-background px-3 py-2" value={currentId} disabled={saving || deletion.isLoading} onChange={event => switchQuote(event.target.value)}>{records.map(record => <option key={record.id} value={record.id}>{record.number || record.id} · {record.name || '未命名報價'}</option>)}{currentId === 'new' && <option value="new">新增報價單</option>}</select></label>}</div>
      <div className="flex gap-2">{allowDelete && current && can('quotes.delete') && <DeleteRecordsButton title="報價單" includesVersions records={[{ id: current.id!, name: current.name || current.number || '報價單' }]} onDelete={remove} disabled={dirty || deletion.isLoading} />}{allowCreate && can('quotes.create') && currentId !== 'new' && <Button disabled={saving || deletion.isLoading} onClick={() => switchQuote('new')}>新增報價單</Button>}</div>
    </div>
    {!allowCreate && <p className="mt-3 text-xs text-muted-foreground">商機已結案，無法新增報價單。{!allowDelete && '需求成交的商機也不可刪除報價單。'}</p>}
    {currentId ? <QuoteDetailView key={currentId} id={currentId} parentOpportunityId={opportunityId} embedded onCreated={created} onDirtyChange={setDirty} onSavingChange={setSaving} /> : <p className="rounded-xl border p-8 mt-5 text-center text-muted-foreground">此商機尚無關聯報價單。</p>}
  </div>;
}
