import { Lookup } from '@/components/ui/lookup';
import { CustomerPageHeader, CustomerPageTitle } from '../components/customer-page-header';
import { ArrowLeft, UserRound, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { Contact } from '../models/customer-model';
import { useContactEditViewModel } from '../view-models/use-contact-edit-view-model';

export function ContactEditView({ contact }: { contact?: Contact }) {
  const vm = useContactEditViewModel(contact);
  return (
    <>
      <CustomerPageHeader className="py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="返回聯絡人列表" onClick={vm.back}>
            <ArrowLeft />
          </Button>
          <CustomerPageTitle>
            <UserRound size={19} /> {vm.isNew ? '新增聯絡人' : '編輯聯絡人'}
          </CustomerPageTitle>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
            onClick={vm.back}
          >
            取消
          </Button>
          <Button type="button" variant="outline" onClick={vm.reset}>
            <RotateCcw /> 重置
          </Button>
          <Button type="submit" form="contact-edit-form">
            <Save /> {vm.isNew ? '建立資料' : '儲存變更'}
          </Button>
        </div>
      </CustomerPageHeader>
      <form id="contact-edit-form" onSubmit={vm.save} className="mx-auto w-full max-w-5xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>聯絡人基本資料</CardTitle>
            <CardDescription>{vm.isNew ? '填寫聯絡方式與所屬客戶。' : '更新聯絡方式與所屬客戶。'}儲存後將返回列表。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="contact-customer">所屬客戶 *</Label>
              <Lookup
                id="contact-customer"
                label="所屬客戶"
                placeholder="請選擇客戶"
                required
                value={vm.draft.customerId}
                options={vm.customers.map(customer => ({ value: customer.id, label: customer.name }))}
                onValueChange={value => vm.updateField('customerId', value)}
              />
            </div>
            {(
              [
                { field: 'name', label: '聯絡人姓名', required: true },
                { field: 'title', label: '職稱' },
                { field: 'email', label: '電子郵件', type: 'email' },
                { field: 'phone', label: '電話', type: 'tel' },
              ] as const
            ).map((item) => (
              <div key={item.field} className="space-y-2">
                <Label htmlFor={`contact-${item.field}`}>
                  {item.label}
                  {'required' in item && ' *'}
                </Label>
                <Input
                  id={`contact-${item.field}`}
                  value={vm.draft[item.field]}
                  type={'type' in item ? item.type : 'text'}
                  required={'required' in item}
                  onChange={(event) => vm.updateField(item.field, event.target.value)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
        <p className="mt-4 text-xs text-muted-foreground">
          目前為前端示範，修改僅保留於本次使用期間，重新整理後會還原。
        </p>
        <p role="status" className="mt-3 text-sm text-destructive">
          {vm.error}
        </p>
      </form>
    </>
  );
}
