import { ValidatedSelect } from '@/components/entity/validated-controls';
import { EntityEditLayout } from '@/components/entity/entity-edit-layout';
import { EntityField } from '@/components/entity/entity-field';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Currency } from '../models/currency-model';
import { useCurrencyEditViewModel } from '../view-models/use-currency-edit-view-model';

export function CurrencyEditView({ record }: { record?: Currency }) {
  const form = useCurrencyEditViewModel(record);
  const { draft, update } = form;
  return <EntityEditLayout title="幣別" isNew={!record} formId="currency-form" form={form}>
    <Card>
      <CardHeader><CardTitle>幣別基本資料</CardTitle></CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        <EntityField id="currency-name" label="名稱 *">
          <Input id="currency-name" required maxLength={255} value={draft.name} onChange={e => update('name', e.target.value)} />
        </EntityField>
        <EntityField id="currency-code" label="幣別代碼 *">
          <Input id="currency-code" required pattern="[A-Z]{3}" title="請輸入三碼大寫英文字母幣別代碼。" maxLength={3} readOnly={!!record} value={draft.code} onChange={e => update('code', e.target.value.toUpperCase())} />
          <p className="mt-1 text-xs text-muted-foreground">三碼大寫英文字母，建立後不可修改。</p>
        </EntityField>
        <EntityField id="currency-symbol" label="符號 *">
          <Input id="currency-symbol" required maxLength={32} value={draft.symbol} onChange={e => update('symbol', e.target.value)} />
        </EntityField>
        <EntityField id="currency-fraction-digits" label="小數位數 *">
          <Input id="currency-fraction-digits" name="fractionDigits" type="number" required min={0} max={3} step={1} value={draft.fractionDigits} onChange={e => update('fractionDigits', e.target.valueAsNumber)} />
          <p className="mt-1 text-xs text-muted-foreground">目前報價僅支援選用 2 位小數的幣別。</p>
        </EntityField>
        <EntityField id="currency-active" label="狀態">
          <ValidatedSelect id="currency-active" className="h-9 w-full rounded-lg border px-3 text-sm" value={String(draft.active)} onChange={e => update('active', e.target.value === 'true')}>
            <option value="true">啟用</option><option value="false">停用</option>
          </ValidatedSelect>
          <p className="mt-1 text-xs text-muted-foreground">停用後不供新交易選用，歷史交易保留原幣別。</p>
        </EntityField>
      </CardContent>
    </Card>
  </EntityEditLayout>;
}
