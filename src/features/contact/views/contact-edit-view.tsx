import type { ContactResponse } from '../../../api/Api';
import { EntityEditLayout } from '@/components/entity/entity-edit-layout';
import { EntityField } from '@/components/entity/entity-field';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Lookup } from '@/components/ui/lookup';
import { Button } from '@/components/ui/button';
import { useContactEditViewModel } from '../view-models/use-contact-edit-view-model';

export function ContactEditView({ contact }: { contact?: ContactResponse }) {
  const form = useContactEditViewModel(contact);
  const { draft, update, customerQuery } = form;
  return <EntityEditLayout title="聯絡人" isNew={!contact} formId="contact-form" form={form} dataNotice={null}>
    <Card>
      <CardHeader><CardTitle>聯絡人基本資料</CardTitle></CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        <EntityField id="contact-customer" label="所屬客戶 *">
          <Lookup id="contact-customer" label="所屬客戶" required value={draft.customerId ?? ''}
            options={customerQuery.records.map(customer => ({ value: customer.id ?? '', label: customer.name ?? '' }))}
            onValueChange={value => update('customerId', value)} />
          {customerQuery.isLoading && <p role="status" className="text-sm text-muted-foreground">載入客戶…</p>}
          {customerQuery.error && <div role="alert" className="text-sm text-destructive">
            無法載入客戶：{customerQuery.error.message}
            <Button type="button" variant="outline" onClick={customerQuery.reload}>重試</Button>
          </div>}
        </EntityField>
        {([
          { field: 'name', label: '聯絡人姓名', required: true },
          { field: 'company', label: '公司' },
          { field: 'email', label: '電子郵件', type: 'email' },
          { field: 'phone', label: '電話', type: 'tel' },
          { field: 'owner', label: '負責人' },
        ] as const).map(item => <EntityField key={item.field} id={`contact-${item.field}`} label={`${item.label}${'required' in item ? ' *' : ''}`}>
          <Input id={`contact-${item.field}`} value={draft[item.field] ?? ''} required={'required' in item}
            type={'type' in item ? item.type : 'text'} onChange={event => update(item.field, event.target.value)} />
        </EntityField>)}
      </CardContent>
    </Card>
  </EntityEditLayout>;
}
