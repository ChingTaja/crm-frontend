import { EntityEditLayout } from '@/components/entity/entity-edit-layout'
import { EntityField } from '@/components/entity/entity-field'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useLeadEditViewModel } from '../view-models/use-lead-edit-view-model'
import { type Lead } from '../models/lead-model'
import { LeadQualificationDialog } from '../components/lead-qualification-dialog'
import { LeadQualificationSummary } from '../components/lead-qualification-summary'

export function LeadEditView({ record }: { record?: Lead }) {
  const form = useLeadEditViewModel(record)
  const { draft, update } = form
  const statuses = [...new Set(['待聯繫', '聯繫中', ...(record ? [record.status] : [])])]
  return <EntityEditLayout title="潛在客戶" isNew={!record} formId="lead-form" form={form} headingAction={record && <LeadQualificationDialog lead={record} disabled={form.isDirty} />} notice={<LeadQualificationSummary lead={record} dirty={form.isDirty} />}>
    <Card><CardHeader><CardTitle>潛在客戶基本資料</CardTitle></CardHeader><CardContent className="grid gap-6 sm:grid-cols-2">
      <EntityField id="lead-name" label="名稱 *"><Input id="lead-name" required value={draft.name} onChange={e => update('name', e.target.value)} /></EntityField>
      <EntityField id="lead-status" label="狀態"><select id="lead-status" className="h-9 w-full rounded-lg border px-3 text-sm" disabled={!!record?.qualification} value={draft.status} onChange={e => update('status', e.target.value as Lead['status'])}>{statuses.map(value => <option key={value}>{value}</option>)}</select></EntityField>
      <EntityField id="lead-company" label="公司"><Input id="lead-company" type="text" value={draft.company} onChange={e => update('company', e.target.value)} /></EntityField>
      <EntityField id="lead-email" label="電子郵件"><Input id="lead-email" type="email" value={draft.email} onChange={e => update('email', e.target.value)} /></EntityField>
      <EntityField id="lead-phone" label="電話"><Input id="lead-phone" type="tel" value={draft.phone} onChange={e => update('phone', e.target.value)} /></EntityField>
      <EntityField id="lead-source" label="來源"><Input id="lead-source" type="text" value={draft.source} onChange={e => update('source', e.target.value)} /></EntityField>
      <EntityField id="lead-owner" label="負責人"><Input id="lead-owner" type="text" value={draft.owner} onChange={e => update('owner', e.target.value)} /></EntityField>
    </CardContent></Card>
  </EntityEditLayout>
}
