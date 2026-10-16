import { ValidatedSelect } from '@/components/entity/validated-controls';
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { useAccess } from '@/features/access/view-models/use-access';
import { quoteApi, quoteCache, refreshQuoteAfterForbidden } from '@/features/quote/models/quote-service';
import type { Quote } from '@/features/quote/models/quote-types';
import { QuoteDetailView } from '@/features/quote/views/quote-view';
import { DeleteRecordsButton } from '@/components/entity/delete-records-button';
import { Button } from '@/components/ui/button';
import { useApi } from '@/hooks/use-api';
import { collectPages } from '@/lib/api-pagination';
import { opportunityApi } from '../models/opportunity-service';
import { quoteCreationBlockedReason, hasQuoteAction } from '@/features/quote/models/quote-permissions';

export function OpportunityQuotesView({ opportunityId, opportunityName }: { opportunityId: string; opportunityName?: string }) {
  const { me } = useAccess();
  const request = useCallback((signal: AbortSignal) => collectPages(signal, (signal, page) => quoteApi.list(signal, { ...page, opportunityId })), [opportunityId]);
  const { data, error, execute, cancel } = useApi(request);
  const parentCheck = useApi(opportunityApi.get);
  const { execute: loadParent, cancel: cancelParent } = parentCheck;
  useEffect(() => {
    const reload = () => { void loadParent(opportunityId).catch(() => {}); };
    reload();
    window.addEventListener('crm:permissions-changed', reload);
    return () => { cancelParent(); window.removeEventListener('crm:permissions-changed', reload); };
  }, [loadParent, cancelParent, opportunityId]);
  const cachedQuotes = useSyncExternalStore(quoteCache.subscribe, quoteCache.getSnapshot);
  const creationReason = quoteCreationBlockedReason(parentCheck.data, me ? { id: me.id, name: me.username, permissionCodes: me.permissionCodes } : null);
  const allowCreate = !parentCheck.error && !parentCheck.isLoading && !creationReason;
  const deletion = useApi(quoteApi.removeMany);
  const [selected, setSelected] = useState('');
  const [selectedVersionId, setSelectedVersionId] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => { void execute().catch(() => {}); return cancel; }, [execute, cancel]);
  const records = data ?? [];
  const currentId = selected || records[0]?.id || (allowCreate ? 'new' : '');
  const current = records.find(record => record.id === currentId);
  const detail = cachedQuotes.find(record => record.id === currentId);
  const selectedVersion = detail?.versions.find(version => version.id === selectedVersionId) ?? detail?.versions[detail.versions.length - 1];
  const allowDelete = hasQuoteAction(selectedVersion, 'delete');
  function switchQuote(id: string) {
    if (saving || deletion.isLoading) return;
    if (dirty && !window.confirm('切換報價將捨棄尚未儲存的修改，是否繼續？')) return;
    setDirty(false);
    setSelected(id);
    setSelectedVersionId('');
  }
  function created(quote: Quote) {
    setDirty(false);
    setSelected(quote.id);
    setSelectedVersionId('');
    void execute().catch(() => {});
  }
  async function remove() {
    if (!allowDelete || !current?.id) return;
    let result;
    try {
      result = await deletion.execute([current.id]);
    } catch (error) {
      await refreshQuoteAfterForbidden(error, current.id);
      await execute().catch(() => {});
      throw error;
    }
    quoteCache.removeMany(result.deleted);
    setSelected('');
    setSelectedVersionId('');
    setDirty(false);
    await execute();
  }
  if (error && !data) return <div role="alert" className="space-y-3 py-8"><p>無法載入商機報價：{error.message}</p><Button variant="outline" onClick={() => { void execute().catch(() => {}); }}>重試</Button></div>;
  if (!data) return <p role="status" className="py-8 text-muted-foreground">載入商機報價…</p>;
  return <div>
    {error && <p role="alert">無法重新載入商機報價：{error.message}</p>}
    <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-muted/20 p-4">
      <div className="space-y-2"><p className="text-xs text-muted-foreground">「{opportunityName || '此商機'}」的報價單</p>{records.length > 0 && <label className="flex items-center gap-2 text-sm">報價單<ValidatedSelect aria-label="切換此商機的報價單" className="max-w-full rounded-lg border bg-background px-3 py-2" value={currentId} disabled={saving || deletion.isLoading} onChange={event => switchQuote(event.target.value)}>{records.map(record => <option key={record.id} value={record.id}>{record.number || record.id} · {record.name || '未命名報價'}</option>)}{currentId === 'new' && <option value="new">新增報價單</option>}</ValidatedSelect></label>}</div>
      <div className="flex gap-2">{allowDelete && current && <DeleteRecordsButton title="報價單" includesVersions records={[{ id: current.id!, name: current.name || current.number || '報價單' }]} onDelete={remove} disabled={dirty || deletion.isLoading} />}{allowCreate && currentId !== 'new' && <Button disabled={saving || deletion.isLoading} onClick={() => switchQuote('new')}>新增報價單</Button>}</div>
    </div>
    {!allowCreate && <p role="status" className="mt-3 text-xs text-muted-foreground">{parentCheck.error?.message || (parentCheck.isLoading ? '確認新增報價權限…' : creationReason)}</p>}
    {currentId ? <QuoteDetailView key={currentId} id={currentId} parentOpportunityId={opportunityId} embedded onVersionChange={setSelectedVersionId} onCreated={created} onDirtyChange={setDirty} onSavingChange={setSaving} /> : <p className="rounded-xl border p-8 mt-5 text-center text-muted-foreground">此商機尚無關聯報價單。</p>}
  </div>;
}
