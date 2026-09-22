import { EntityPageHeader, EntityPageTitle } from '@/components/layout/entity-page-header';
import { ArrowLeft, Building2, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { Customer } from '../models/customer-model';
import { useCustomerEditViewModel } from '../view-models/use-customer-edit-view-model';

export function CustomerEditView({ customer }: { customer?: Customer }) {
  const vm = useCustomerEditViewModel(customer);
  return (
    <>
      <EntityPageHeader className="py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="返回客戶列表" onClick={vm.back}>
            <ArrowLeft />
          </Button>
          <EntityPageTitle>
            <Building2 size={19} /> {vm.isNew ? '新增客戶' : '編輯客戶'}
          </EntityPageTitle>
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
          <Button type="submit" form="customer-edit-form">
            <Save /> {vm.isNew ? '建立資料' : '儲存變更'}
          </Button>
        </div>
      </EntityPageHeader>
      <form id="customer-edit-form" onSubmit={vm.save} className="mx-auto w-full max-w-5xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>客戶基本資料</CardTitle>
            <CardDescription>
              {vm.isNew ? '填寫客戶資訊與負責人。' : '更新客戶資訊與負責人。'}儲存後將返回列表。
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            {(
              [
                { field: 'name', label: '客戶名稱', required: true },
                { field: 'industry', label: '產業' },
                { field: 'owner', label: '帳戶所有者' },
                { field: 'createdAt', label: '建立日期', type: 'date', readOnly: true },
                { field: 'address', label: '地址' },
              ] as const
            ).map((item) => (
              <div key={item.field} className={item.field === 'address' ? 'space-y-2 sm:col-span-2' : 'space-y-2'}>
                <Label htmlFor={`edit-${item.field}`}>
                  {item.label}
                  {'required' in item && ' *'}
                </Label>
                <Input
                  id={`edit-${item.field}`}
                  value={vm.draft[item.field]}
                  type={'type' in item ? item.type : 'text'}
                  required={'required' in item}
                  readOnly={'readOnly' in item}
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
