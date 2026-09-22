import { EntityEditLayout } from '@/components/entity/entity-edit-layout'
import { EntityField } from '@/components/entity/entity-field'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useProductEditViewModel } from '../view-models/use-product-edit-view-model'
import { type Product, productStatuses } from '../models/product-model'

export function ProductEditView({ record }: { record?: Product }) {
  const form = useProductEditViewModel(record)
  const { draft, update } = form
  return <EntityEditLayout title="產品" isNew={!record} formId="product-form" form={form}>
    <Card><CardHeader><CardTitle>產品基本資料</CardTitle></CardHeader><CardContent className="grid gap-6 sm:grid-cols-2">
      <EntityField id="product-name" label="名稱 *"><Input id="product-name" required value={draft.name} onChange={e => update('name', e.target.value)} /></EntityField>
      <EntityField id="product-status" label="狀態"><select id="product-status" className="h-9 w-full rounded-lg border px-3 text-sm" value={draft.status} onChange={e => update('status', e.target.value as Product['status'])}>{productStatuses.map(value => <option key={value}>{value}</option>)}</select></EntityField>
      <EntityField id="product-sku" label="產品編號 *"><Input id="product-sku" type="text" required value={draft.sku} onChange={e => update('sku', e.target.value)} /></EntityField>
      <EntityField id="product-price" label="單價（TWD）"><Input id="product-price" type="number" required min="0" step="0.01" value={draft.price} onChange={e => update('price', e.target.valueAsNumber)} /></EntityField>
    </CardContent></Card>
  </EntityEditLayout>
}
