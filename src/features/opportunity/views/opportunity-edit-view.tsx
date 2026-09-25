import { EntityEditLayout } from '@/components/entity/entity-edit-layout'
import { EntityField } from '@/components/entity/entity-field'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useOpportunityEditViewModel } from '../view-models/use-opportunity-edit-view-model'
import { type Opportunity, opportunityStages } from '../models/opportunity-model'
import { Lookup } from '@/components/ui/lookup'
import { Button } from '@/components/ui/button'

export function OpportunityEditView({ record }: { record?: Opportunity }) {
  const form = useOpportunityEditViewModel(record)
  const { draft, update } = form
  return <EntityEditLayout title="商機" isNew={!record} formId="opportunity-form" form={form}>
    <Card><CardHeader><CardTitle>商機基本資料</CardTitle></CardHeader><CardContent className="grid gap-6 sm:grid-cols-2">
      <EntityField id="opportunity-name" label="名稱 *"><Input id="opportunity-name" required value={draft.name} onChange={e => update('name', e.target.value)} /></EntityField>
      <EntityField id="opportunity-stage" label="階段"><select id="opportunity-stage" className="h-9 w-full rounded-lg border px-3 text-sm" value={draft.stage} onChange={e => update('stage', e.target.value as Opportunity['stage'])}>{opportunityStages.map(value => <option key={value}>{value}</option>)}</select></EntityField>
      <EntityField id="opportunity-owner" label="負責人"><Input id="opportunity-owner" type="text" value={draft.owner} onChange={e => update('owner', e.target.value)} /></EntityField>
      <EntityField id="opportunity-expectedCloseDate" label="預計成交日"><Input id="opportunity-expectedCloseDate" type="date" value={draft.expectedCloseDate} onChange={e => update('expectedCloseDate', e.target.value)} /></EntityField>
      <EntityField id="opportunity-customer" label="所屬客戶 *"><Lookup id="opportunity-customer" label="所屬客戶" required value={draft.customerId} options={form.customers.map(c => ({ value: c.id, label: c.name }))} onValueChange={value => update('customerId', value)} /></EntityField>
      <EntityField id="opportunity-lead" label="來源 Lead">
        <Lookup id="opportunity-lead" label="來源 Lead" value={draft.leadId} options={[{ value: '', label: '無' }, ...form.leads.map(l => ({ value: l.id, label: l.name }))]} onValueChange={value => update('leadId', value)} />
        {form.leadQuery.isLoading && <p role="status" className="text-xs text-muted-foreground">載入 Lead…</p>}
        {form.leadQuery.error && <div role="alert" className="text-xs text-destructive">{form.leadQuery.error.message}<Button type="button" variant="ghost" size="sm" onClick={form.leadQuery.reload}>重試</Button></div>}
      </EntityField>
      <EntityField id="opportunity-amount" label="預估金額（TWD）"><Input id="opportunity-amount" type="number" required min="0" step="0.01" value={draft.amount} onChange={e => update('amount', e.target.valueAsNumber)} /></EntityField>
    </CardContent></Card>
  </EntityEditLayout>
}
