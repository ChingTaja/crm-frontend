import { EntityEditLayout } from '@/components/entity/entity-edit-layout'
import { EntityField } from '@/components/entity/entity-field'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useOrderEditViewModel } from '../view-models/use-order-edit-view-model'
import { type Order, orderStatuses } from '../models/order-model'
import { Lookup } from '@/components/ui/lookup'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export function OrderEditView({ record }: { record?: Order }) {
  const form = useOrderEditViewModel(record)
  const { draft, update } = form
  return <EntityEditLayout title="訂單" isNew={!record} formId="order-form" form={form}>
    <Card><CardHeader><CardTitle>訂單基本資料</CardTitle></CardHeader><CardContent className="grid gap-6 sm:grid-cols-2">
      <EntityField id="order-name" label="名稱 *"><Input id="order-name" required value={draft.name} onChange={e => update('name', e.target.value)} /></EntityField>
      <EntityField id="order-status" label="狀態"><select id="order-status" className="h-9 w-full rounded-lg border px-3 text-sm" value={draft.status} onChange={e => update('status', e.target.value as Order['status'])}>{orderStatuses.map(value => <option key={value}>{value}</option>)}</select></EntityField>
      <EntityField id="order-customer" label="所屬客戶 *"><Lookup id="order-customer" label="所屬客戶" required value={draft.customerId} options={form.customers.map(c => ({ value: c.id ?? '', label: c.name ?? '' }))} onValueChange={value => update('customerId', value)} /></EntityField>
      <EntityField id="order-opportunity" label="來源商機"><Lookup id="order-opportunity" label="來源商機" value={draft.opportunityId} options={[{ value: '', label: '無' }, ...form.opportunities.filter(o => o.customerId === draft.customerId).map(o => ({ value: o.id, label: o.name }))]} onValueChange={value => update('opportunityId', value)} /></EntityField>
    </CardContent></Card>
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>訂單明細</CardTitle>
              <Button
                type="button"
                variant="outline"
                onClick={() => update('items', [...draft.items, { productId: '', quantity: 1, unitPrice: 0 }])}
              >
                <Plus />
                加入產品
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {draft.items.map((line, index) => (
                <div key={index} className="grid items-end gap-3 rounded-lg border p-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
                  <div className="space-y-2">
                    <Label htmlFor={`product-${index}`}>產品 *</Label>
                    <Lookup
                      id={`product-${index}`}
                      label="產品"
                      value={line.productId}
                      options={form.products
                        .filter((p) => p.status === '啟用' || p.id === line.productId)
                        .map((p) => ({ value: p.id, label: p.name, keywords: p.sku }))}
                      onValueChange={(value) =>
                        update(
                          'items',
                          draft.items.map((item, i) =>
                            i === index
                              ? {
                                  ...item,
                                  productId: value,
                                  unitPrice: form.products.find((p) => p.id === value)?.price ?? 0,
                                }
                              : item
                          )
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`qty-${index}`}>數量</Label>
                    <Input
                      id={`qty-${index}`}
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={line.quantity}
                      onChange={(e) =>
                        update(
                          'items',
                          draft.items.map((item, i) =>
                            i === index ? { ...item, quantity: e.target.valueAsNumber } : item
                          )
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`price-${index}`}>單價（TWD）</Label>
                    <Input
                      id={`price-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={line.unitPrice}
                      onChange={(e) =>
                        update(
                          'items',
                          draft.items.map((item, i) =>
                            i === index ? { ...item, unitPrice: e.target.valueAsNumber } : item
                          )
                        )
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`移除第 ${index + 1} 筆產品`}
                    onClick={() =>
                      update(
                        'items',
                        draft.items.filter((_, i) => i !== index)
                      )
                    }
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
              {!draft.items.length && <p className="text-sm text-muted-foreground">請加入至少一筆產品。</p>}
              <p className="text-right font-semibold">
                總金額：NT${' '}
                {draft.items
                  .reduce(
                    (sum, line) =>
                      sum + (Number.isFinite(line.quantity * line.unitPrice) ? line.quantity * line.unitPrice : 0),
                    0
                  )
                  .toLocaleString('zh-TW')}
              </p>
            </CardContent>
          </Card>
  </EntityEditLayout>
}
