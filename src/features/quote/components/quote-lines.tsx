import { availableQuoteProducts } from '../models/quote-pricing';
import { ValidatedGroup } from '@/components/entity/validated-group';
import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { currencyApi } from '@/features/currency/models/currency-service';
import { Plus, Trash2, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lookup } from '@/components/ui/lookup';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { ProductResponse, QuoteTotals as ApiQuoteTotals } from '../../../api/Api';
import type { QuoteEditor } from '../view-models/use-quote-editor';
import { money, quoteLineTotals, quoteTotals } from '../models/quote-policy';
import type { QuoteLine } from '../models/quote-types';

export function QuoteTotals({
  lines,
  snapshot,
  currency = 'TWD',
  preview = true,
}: {
  lines: QuoteLine[];
  snapshot?: ApiQuoteTotals;
  currency?: string;
  preview?: boolean;
}) {
  const totals: ApiQuoteTotals = snapshot ?? (preview ? quoteTotals(lines) : {});
  return (
    <dl className="ml-auto grid w-full min-w-0 max-w-sm grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-3 text-sm [&_dd]:min-w-0 [&_dd]:[overflow-wrap:anywhere]">
      <dt>未稅原價</dt>
      <dd className="text-right">{totals.subtotalCents == null ? '—' : money(totals.subtotalCents, currency)}</dd>
      <dt>折扣</dt>
      <dd className="text-right">− {totals.discountCents == null ? '—' : money(totals.discountCents, currency)}</dd>
      <dt>稅金</dt>
      <dd className="text-right">{totals.taxCents == null ? '—' : money(totals.taxCents, currency)}</dd>
      <dt className="border-t pt-3 font-semibold">含稅總金額</dt>
      <dd className="border-t pt-3 text-right text-lg font-semibold">
        {totals.totalCents == null ? '—' : money(totals.totalCents, currency)}
      </dd>
    </dl>
  );
}
export function QuoteLines({ editor, products }: { editor: QuoteEditor; products: Required<ProductResponse>[] }) {
  const [pendingCurrency, setPendingCurrency] = useState<{ from: string; to: string } | null>(null);
  const { data: currencies, error, isLoading, execute, cancel } = useApi(currencyApi.list);
  useEffect(() => {
    void execute().catch(() => {});
    return cancel;
  }, [execute, cancel]);
  const currency = editor.draft.currency;
  const options = (currencies ?? [])
    .filter((item) => item.active && item.fractionDigits === 2)
    .map((item) => ({ value: item.code, label: `${item.code} · ${item.name}` }));
  if (!options.some((item) => item.value === currency)) options.push({ value: currency, label: currency });
  return (
    <ValidatedGroup
      name="lines"
      validate={() => (editor.editable && !editor.draft.lines.length ? '請至少新增一筆商品明細。' : '')}
    >
      <Card className="min-w-0 max-w-full">
        <CardHeader className="grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <CardTitle>報價明細</CardTitle>
          {editor.editable && (
            <Button type="button" variant="outline" onClick={editor.addLine}>
              <Plus />
              新增商品
            </Button>
          )}
        </CardHeader>
        <CardContent className="min-w-0 space-y-6">
          <div className="max-w-sm space-y-2">
            <p id="quote-currency-label" className="text-sm font-medium">
              報價幣別 *
            </p>
            {editor.editable ? (
              <Lookup
                id="quote-currency"
                name="currency"
                required
                label="報價幣別"
                value={currency}
                options={options}
                disabled={isLoading || !!error || !currencies}
                onValueChange={(value) => {
                  if (value !== currency) setPendingCurrency({ from: currency, to: value });
                }}
              />
            ) : (
              <p aria-labelledby="quote-currency-label">{currency || '幣別未提供'}</p>
            )}
            <p className="text-xs text-muted-foreground">
              所有明細共用報價幣別；產品參考價不代表已換算的交易單價，請逐筆填寫確認。
            </p>
          </div>
          <div
            className="w-full min-w-0 overflow-x-auto overscroll-x-contain"
            role="region"
            aria-label="報價明細，可左右捲動"
            tabIndex={0}
          >
            <table className="w-full min-w-[976px] table-fixed text-left text-sm">
              <colgroup>
                <col className="w-[280px]" />
                <col className="w-[96px]" />
                <col className="w-[144px]" />
                <col className="w-[112px]" />
                <col className="w-[112px]" />
                <col className="w-[176px]" />
                <col className="w-[56px]" />
              </colgroup>
              <thead>
                <tr>
                  {['商品', '數量', `單價（${currency}）`, '折扣 %', '稅率 %', '含稅小計', ''].map((label) => (
                    <th key={label} className="border-b px-2 py-3 align-top font-medium text-muted-foreground">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {editor.draft.lines.map((line, index) => (
                  <tr key={line.id} className="[&>td]:align-top">
                    <td className="min-w-0 border-b px-2 py-3 [&_button]:min-w-0">
                      {editor.editable ? (
                        <Lookup
                          name={`lines[${index}].productId`}
                          required
                          label={`第 ${index + 1} 筆商品`}
                          value={line.productId}
                          options={availableQuoteProducts(products, editor.draft.lines, line.id).map((p) => ({
                            value: p.id,
                            label: p.id === line.productId ? line.productName : p.name,
                            keywords: p.sku,
                          }))}
                          onValueChange={(id) => {
                            const product = products.find((p) => p.id === id);
                            if (product) editor.selectProduct(line.id, product);
                          }}
                        />
                      ) : (
                        <p className="break-words [overflow-wrap:anywhere]">{line.productName}</p>
                      )}
                      <p className="mt-1 break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">
                        {line.sku || '尚未選擇'} · 參考價{' '}
                        {new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 2 }).format(line.catalogPrice)}
                      </p>
                    </td>
                    {(['quantity', 'unitPrice', 'discountPercent', 'taxPercent'] as const).map((field) => (
                      <td key={field} className="border-b px-2 py-3">
                        {editor.editable ? (
                          <Input
                            name={`lines[${index}].${field}`}
                            aria-label={`第 ${index + 1} 筆${{ quantity: '數量', unitPrice: '單價', discountPercent: '折扣', taxPercent: '稅率' }[field]}`}
                            type="number"
                            required
                            min={field === 'quantity' ? 1 : 0}
                            max={field === 'discountPercent' || field === 'taxPercent' ? 100 : undefined}
                            step={field === 'quantity' ? 1 : 0.01}
                            value={Number.isFinite(line[field]) ? line[field] : ''}
                            onChange={(event) => editor.updateLine(line.id, field, event.target.valueAsNumber)}
                          />
                        ) : (
                          <span>{line[field]}</span>
                        )}
                      </td>
                    ))}
                    <td className="border-b px-2 py-3 text-right tabular-nums [overflow-wrap:anywhere]">
                      {money(quoteLineTotals(line).totalCents, currency)}
                    </td>
                    <td className="border-b px-2 py-3">
                      {editor.editable && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`移除第 ${index + 1} 筆`}
                          onClick={() => editor.removeLine(line.id)}
                        >
                          <Trash2 />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {error && (
            <div role="status" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              無法載入幣別，目前保留 {currency}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  void execute().catch(() => {});
                }}
              >
                重試
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">整張報價共用 {currency}，變更幣別後需重新填寫單價</p>
          {!editor.draft.lines.length && <p className="text-sm text-muted-foreground">尚無明細。</p>}
          <QuoteTotals
            lines={editor.draft.lines}
            snapshot={editor.totals}
            currency={currency}
            preview={editor.editable}
          />
          <p className="text-xs text-muted-foreground">稅金按折後金額計算，金額四捨五入至小數點後兩位。</p>
        </CardContent>
      </Card>
      <Dialog
        open={!!pendingCurrency && editor.editable && pendingCurrency.from === currency}
        onOpenChange={open => { if (!open) setPendingCurrency(null); }}
      >
        <DialogContent>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <TriangleAlert className="size-5 text-amber-600" aria-hidden="true" />
            確認變更報價幣別
          </DialogTitle>
          <DialogDescription className="mt-3 text-sm leading-relaxed text-muted-foreground">
            變更整張報價的幣別不會自動換匯，所有明細單價將清空，請重新確認並填寫。是否繼續？
          </DialogDescription>
          <p className="mt-4 rounded-lg border bg-muted/40 p-3 text-sm">
            報價幣別：<strong>{pendingCurrency?.from}</strong> → <strong>{pendingCurrency?.to}</strong>
          </p>
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setPendingCurrency(null)}>
              取消
            </Button>
            <Button type="button" disabled={!editor.editable} onClick={() => {
              if (pendingCurrency && editor.editable && pendingCurrency.from === currency &&
                currencies?.some(item => item.code === pendingCurrency.to && item.active && item.fractionDigits === 2)) {
                editor.update('currency', pendingCurrency.to);
              }
              setPendingCurrency(null);
            }}>
              確認變更並清空單價
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ValidatedGroup>
  );
}
