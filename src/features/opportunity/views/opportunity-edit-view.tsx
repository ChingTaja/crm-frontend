import { useRef, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useAccess } from '@/features/access/view-models/use-access';
import { useApi } from '@/hooks/use-api';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { opportunityApi } from '../models/opportunity-service';
import { cacheOpportunity } from '../models/opportunity-model';
import type { CloseOpportunityRequest, OpportunityResponse } from '../../../api/Api';
import { EntityEditLayout } from '@/components/entity/entity-edit-layout';
import { EntityField } from '@/components/entity/entity-field';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useOpportunityEditViewModel } from '../view-models/use-opportunity-edit-view-model';
import { opportunityOutcome, opportunityStageLabel } from '../models/opportunity-model';
import { Lookup } from '@/components/ui/lookup';
import { Button } from '@/components/ui/button';

export function OpportunityEditView({ record, onClosed }: { record?: OpportunityResponse; onClosed?: (record: OpportunityResponse) => void }) {
  const { can } = useAccess();
  const closure = useApi(opportunityApi.close);
  const [outcome, setOutcome] = useState<CloseOpportunityRequest['outcome'] | null>(null);
  const [description, setDescription] = useState('');
  const busy = useRef(false);
  const result = opportunityOutcome(record?.stage);
  const closed = !!result;
  const form = useOpportunityEditViewModel(record);
  const { draft, update } = form;
  async function confirmClose() {
    if (busy.current || !outcome || !record?.id || closed || !can('opportunities.update') || form.isDirty || form.isSaving) return;
    busy.current = true;
    try {
      const result = await closure.execute(record.id, { outcome, ...(description.trim() ? { description: description.trim() } : {}) });
      cacheOpportunity(result);
      setOutcome(null);
      onClosed?.(result);
    } catch {
      // Preserve the optional description and expose backend errors for retry.
    } finally {
      busy.current = false;
    }
  }
  return (
    <>
    <EntityEditLayout title="商機" isNew={!record} readOnly={closed} formId="opportunity-form" form={{ ...form, isSaving: form.isSaving || closure.isLoading }} dataNotice={null}
      headingAction={record && <span className={`ml-2 rounded-full px-3 py-1 text-xs ${result === 'won' ? 'bg-emerald-50 text-emerald-700' : result === 'lost' ? 'bg-red-50 text-red-700' : 'bg-muted text-muted-foreground'}`}>{opportunityStageLabel(record.stage)}</span>}
      notice={record && <div className="mx-auto mt-6 max-w-5xl rounded-xl border bg-muted/20 p-5">
        {closed ? <div role="status"><p className="font-medium">商機已結案 · {opportunityStageLabel(record.stage)}（唯讀）</p><p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">{result === 'lost' ? `失單理由：${record.closeDescription || '未填寫'}` : record.closeDescription || '未填寫結案描述'}</p>{record.closedAt && <p className="mt-2 text-xs text-muted-foreground">{record.closedAt}{record.closedByName ? ` · ${record.closedByName}` : ''}</p>}</div> : <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-medium">商機結案</h2><p className="mt-1 text-xs text-muted-foreground">{form.isDirty ? '請先儲存或重置修改，再進行結案。' : '確認結果後，將商機標記為成交或失單，可附上描述。'}</p></div>{can('opportunities.update') && <div className="flex gap-2">{(['won', 'lost'] as const).map(value => <Button key={value} type="button" variant={value === 'won' ? 'default' : 'outline'} disabled={form.isSaving || form.isDirty || closure.isLoading} onClick={() => { closure.reset(); setDescription(''); setOutcome(value); }}>{value === 'won' ? <CheckCircle2 aria-hidden="true" /> : <XCircle aria-hidden="true" />}{value === 'won' ? 'Close as won · 成交' : 'Close as lost · 失單'}</Button>)}</div>}</div>}
      </div>}
    >
      <Card>
        <CardHeader>
          <CardTitle>商機基本資料</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <EntityField id="opportunity-name" label="名稱 *">
            <Input id="opportunity-name" required value={draft.name} onChange={(e) => update('name', e.target.value)} />
          </EntityField>
          <EntityField id="opportunity-stage" label="階段">
            <Input id="opportunity-stage" disabled value={record ? opportunityStageLabel(record.stage) : '由後端建立後指定'} />
            <p className="text-xs text-muted-foreground">階段由後端管理，無法直接修改。</p>
            {result === 'lost' && <p className="whitespace-pre-wrap break-words text-sm">失單理由：{record?.closeDescription || '未填寫'}</p>}
          </EntityField>
          <EntityField id="opportunity-owner" label="負責人">
            <Input
              id="opportunity-owner"
              type="text"
              value={draft.owner ?? ''}
              onChange={(e) => update('owner', e.target.value)}
            />
          </EntityField>
          <EntityField id="opportunity-expectedCloseDate" label="預計成交日">
            <Input
              id="opportunity-expectedCloseDate"
              type="date"
              value={draft.expectedCloseDate ?? ''}
              onChange={(e) => update('expectedCloseDate', e.target.value)}
            />
          </EntityField>
          <EntityField id="opportunity-customer" label="所屬客戶 *">
            <Lookup
              id="opportunity-customer"
              label="所屬客戶"
              required
              value={draft.customerId}
              options={form.customers.map((c) => ({ value: c.id ?? '', label: c.name ?? '' }))}
              onValueChange={(value) => update('customerId', value)}
            />
            {form.customerQuery.isLoading && <p role="status">載入客戶…</p>}
            {form.customerQuery.error && (
              <div role="alert" className="text-sm text-destructive">
                {form.customerQuery.error.message}
                <Button type="button" onClick={form.customerQuery.reload}>
                  重試
                </Button>
              </div>
            )}
          </EntityField>
          <EntityField id="opportunity-lead" label="來源 Lead">
            <Lookup
              id="opportunity-lead"
              label="來源 Lead"
              value={draft.leadId ?? ''}
              options={[
                { value: '', label: '無' },
                ...form.leads.map((l) => ({ value: l.id ?? '', label: l.name ?? '' })),
              ]}
              onValueChange={(value) => update('leadId', value)}
            />
            {form.leadQuery.isLoading && (
              <p role="status" className="text-xs text-muted-foreground">
                載入 Lead…
              </p>
            )}
            {form.leadQuery.error && (
              <div role="alert" className="text-xs text-destructive">
                {form.leadQuery.error.message}
                <Button type="button" variant="ghost" size="sm" onClick={form.leadQuery.reload}>
                  重試
                </Button>
              </div>
            )}
          </EntityField>
          <EntityField id="opportunity-amount" label="預估金額（TWD）">
            <Input
              id="opportunity-amount"
              type="number"
              required
              min="0"
              step="0.01"
              value={draft.amount}
              onChange={(e) => update('amount', e.target.valueAsNumber)}
            />
          </EntityField>
        </CardContent>
      </Card>
    </EntityEditLayout>
    <Dialog open={outcome !== null} onOpenChange={open => { if (!open && !closure.isLoading) setOutcome(null); }}>
      <DialogContent>
        <DialogTitle className="text-lg font-semibold">{outcome === 'won' ? 'Close as won · 成交' : 'Close as lost · 失單'}</DialogTitle>
        <DialogDescription className="mt-2 text-sm text-muted-foreground">確認將「{record?.name}」標記為{outcome === 'won' ? '需求成交' : '失單'}？結案不會自動變更報價、建立訂單或標记付款。</DialogDescription>
        <form className="mt-5 space-y-4" onSubmit={event => { event.preventDefault(); void confirmClose(); }}>
          <label className="grid gap-2 text-sm">{outcome === 'lost' ? '失單理由（選填）' : '描述（選填）'}<textarea className="min-h-28 w-full rounded-lg border p-3" placeholder="補充成交資訊或失單原因…" maxLength={2000} value={description} disabled={closure.isLoading} onChange={event => setDescription(event.target.value)} /></label>
          {closure.error && <p role="alert" className="text-sm text-destructive">{closure.error.message}</p>}
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={closure.isLoading} onClick={() => setOutcome(null)}>返回</Button><Button type="submit" disabled={closure.isLoading}>{closure.isLoading ? '結案中…' : '確認結案'}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
