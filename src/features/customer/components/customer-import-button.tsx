import { useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Download,
  FileSpreadsheet,
  FileUp,
  LoaderCircle,
  MinusCircle,
  Upload,
  X,
} from 'lucide-react';
import { useAccess } from '@/features/access/view-models/use-access';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle } from '@/components/ui/popover';
import type { CustomerImportStatus } from '../models/customer-import';
import { useCustomerImport } from '../view-models/use-customer-import';
import { cn } from '@/lib/utils';

const statuses: Record<CustomerImportStatus, { label: string; color: string; icon: typeof Check }> = {
  ready: { label: '可匯入', color: 'bg-emerald-50 text-emerald-700 ring-emerald-200', icon: CheckCircle2 },
  invalid: { label: '欄位錯誤', color: 'bg-red-50 text-red-700 ring-red-200', icon: CircleAlert },
  duplicate: { label: '重複略過', color: 'bg-slate-100 text-slate-600 ring-slate-200', icon: MinusCircle },
  success: { label: '匯入成功', color: 'bg-emerald-50 text-emerald-700 ring-emerald-200', icon: CheckCircle2 },
  failed: { label: '匯入失敗', color: 'bg-red-50 text-red-700 ring-red-200', icon: CircleAlert },
  uncertain: { label: '結果待確認', color: 'bg-amber-50 text-amber-800 ring-amber-200', icon: Clock3 },
  skipped: { label: '已略過', color: 'bg-slate-100 text-slate-600 ring-slate-200', icon: MinusCircle },
};

export function CustomerImportButton({ onImported }: { onImported: () => void }) {
  const { can } = useAccess();
  const vm = useCustomerImport(onImported);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [selectionError, setSelectionError] = useState('');
  const [filter, setFilter] = useState<'all' | 'issues' | 'skipped'>('all');
  if (!can('customers.create')) return null;
  const ready = vm.rows.filter((row) => row.status === 'ready').length;
  const successes = vm.rows.filter((row) => row.status === 'success').length;
  const issues = vm.rows.filter((row) => ['invalid', 'failed', 'uncertain'].includes(row.status)).length;
  const skipped = vm.rows.filter((row) => ['duplicate', 'skipped'].includes(row.status)).length;
  const hasRows = vm.rows.length > 0;
  const busy = vm.isImporting || vm.phase === 'reading';
  const finished = vm.phase === 'done';
  const resultStage = finished || vm.phase === 'retry';
  const currentStep = resultStage ? 2 : hasRows || vm.isImporting ? 1 : 0;
  const visibleRows = vm.rows.filter(
    (row) =>
      filter === 'all' ||
      (filter === 'issues' ? ['invalid', 'failed', 'uncertain'] : ['duplicate', 'skipped']).includes(row.status)
  );
  const error = selectionError || vm.error;

  function selectFiles(files: FileList | null) {
    if (busy || vm.pendingBatch || !files?.length) return;
    if (files.length > 1) {
      setSelectionError('每次請選擇一個 CSV 檔案。');
      return;
    }
    setSelectionError('');
    setFilter('all');
    void vm.selectFile(files[0]);
  }

  const templateButtons = (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="bg-white"
        disabled={vm.downloading}
        onClick={() => void vm.downloadTemplate()}
      >
        {vm.downloading ? <LoaderCircle className="animate-spin" /> : <Download />}
        {vm.downloading ? '準備範本…' : '下載 CSV 範本'}
      </Button>
      <Button
        type="button"
        variant="link"
        size="sm"
        className="text-[#315740]"
        disabled={vm.downloading}
        onClick={() => void vm.downloadTemplate(true)}
      >
        下載填寫範例
        <ArrowRight />
      </Button>
    </div>
  );

  return (
    <>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setSelectionError('');
            setDragging(false);
            setFilter('all');
            vm.changeOpen(true);
          }}
        >
          <Upload />
          批次上傳
        </Button>
        <Popover>
          <PopoverTrigger
            openOnHover
            delay={150}
            closeDelay={150}
            render={<Button type="button" variant="ghost" size="icon" aria-label="客戶批次上傳說明" />}
          >
            <CircleAlert className="size-4 text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent className="space-y-3 p-4 text-sm">
            <PopoverTitle className="font-semibold">客戶批次上傳說明</PopoverTitle>
            <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
              <li>支援 UTF-8 CSV，單檔上限 5 MB，每次最多 500 筆。</li>
              <li>客戶名稱必填，電話請保留開頭的 0。</li>
              <li>重複資料會略過，不覆寫現有客戶。</li>
              <li>空白範本與填寫範例分開下載。</li>
            </ul>
            {templateButtons}
            {!vm.open && vm.error && (
              <p role="alert" className="text-xs text-destructive">
                {vm.error}
              </p>
            )}
          </PopoverContent>
        </Popover>
      </div>

      <Dialog open={vm.open} onOpenChange={vm.changeOpen}>
        <DialogContent className="flex max-h-[90svh] w-[calc(100%-1.5rem)] max-w-6xl flex-col overflow-hidden rounded-2xl p-0">
          <div className="shrink-0 border-b border-[#e7ebe6] bg-white px-5 pt-6 sm:px-7">
            <div className="flex items-start gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#edf3eb] text-[#315740]">
                <FileUp className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-lg font-semibold tracking-tight text-[#263d37] sm:text-xl">
                  批次上傳客戶
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  匯入 CSV 客戶名單，預覽確認後再建立資料。
                </DialogDescription>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="-mt-1 text-muted-foreground"
                aria-label="關閉批次上傳"
                disabled={vm.isImporting}
                onClick={() => vm.changeOpen(false)}
              >
                <X />
              </Button>
            </div>
            <ol aria-label="匯入進度" className="mt-6 grid grid-cols-3 gap-2 pb-5 sm:gap-5">
              {['上傳檔案', '預覽檢查', '匯入結果'].map((label, index) => (
                <li
                  key={label}
                  aria-current={currentStep === index ? 'step' : undefined}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-2 py-2 text-xs sm:px-3 sm:text-sm',
                    currentStep === index ? 'bg-[#f0f4ee] font-medium text-[#315740]' : 'text-muted-foreground'
                  )}
                >
                  <span
                    className={cn(
                      'grid size-6 shrink-0 place-items-center rounded-full text-xs',
                      currentStep === index
                        ? 'bg-[#315740] text-white'
                        : currentStep > index
                          ? 'bg-[#e6eee2] text-[#315740]'
                          : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {currentStep > index ? <Check className="size-3.5" /> : index + 1}
                  </span>
                  {label}
                </li>
              ))}
            </ol>
          </div>

          <div className="min-h-0 min-w-0 flex-1 space-y-5 overflow-y-auto bg-[#fafbf9] p-5 sm:p-7">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <div
                className={cn(
                  'flex min-w-0 flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 py-6 text-center transition-colors',
                  hasRows ? 'min-h-36' : 'min-h-48',
                  dragging ? 'border-[#56775e] bg-[#eaf1e7]' : 'border-[#d8e1d5] bg-white',
                  busy && 'opacity-70'
                )}
                onDragOver={(event) => {
                  event.preventDefault();
                  if (!busy) {
                    event.dataTransfer.dropEffect = 'copy';
                    setDragging(true);
                  }
                }}
                onDragLeave={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  selectFiles(event.dataTransfer.files);
                }}
              >
                <input
                  ref={fileInput}
                  type="file"
                  accept=".csv,text/csv"
                  className="sr-only"
                  tabIndex={-1}
                  aria-label="選擇客戶 CSV 檔案"
                  disabled={busy || vm.pendingBatch}
                  onChange={(event) => {
                    selectFiles(event.target.files);
                    event.target.value = '';
                  }}
                />
                <div className="mb-3 grid size-11 place-items-center rounded-xl bg-[#f1f5ee] text-[#56775e]">
                  {busy ? (
                    <LoaderCircle className="size-5 animate-spin" />
                  ) : vm.filename ? (
                    <FileSpreadsheet className="size-5" />
                  ) : (
                    <Upload className="size-5" />
                  )}
                </div>
                <p className="max-w-full break-all text-sm font-medium text-[#263d37]">
                  {vm.filename || '將 CSV 檔案拖曳到這裡'}
                </p>
                <p role="status" className="mt-1 text-xs text-muted-foreground">
                  {vm.phase === 'reading'
                    ? '正在讀取並檢查欄位…'
                    : vm.isImporting
                      ? '正在匯入，請稍候…'
                      : vm.pendingBatch
                        ? '請先以原批次重新取得匯入結果，再上傳其他檔案'
                        : vm.filename
                          ? '可重新選擇檔案，取代目前的名單'
                          : '支援 UTF-8 CSV · 上限 5 MB · 最多 500 筆'}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4 bg-white"
                  disabled={busy || vm.pendingBatch}
                  onClick={() => fileInput.current?.click()}
                >
                  {vm.filename ? '重新選擇檔案' : '選擇檔案'}
                </Button>
              </div>
              <div className="flex flex-col justify-center rounded-xl border border-[#e1e7dc] bg-[#f2f5ef] p-5">
                <p className="flex items-center gap-2 text-sm font-medium text-[#315740]">
                  <FileSpreadsheet className="size-4" />
                  第一次匯入？從範本開始
                </p>
                <p className="mt-2 text-xs leading-6 text-[#6c7868]">
                  客戶名稱為必填，其餘欄位可留空。
                  <br />
                  電話請使用文字格式，保留開頭的 0。
                  <br />
                  填寫後另存為 UTF-8 CSV，再上傳檔案。
                </p>
                <div className="mt-4">{templateButtons}</div>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className={cn(
                  'flex items-start gap-2 rounded-xl border p-4 text-sm leading-relaxed',
                  vm.phase === 'retry'
                    ? 'border-amber-200 bg-amber-50 text-amber-900'
                    : 'border-red-200 bg-red-50 text-red-700'
                )}
              >
                <CircleAlert className="mt-0.5 size-4 shrink-0" />
                <p className="min-w-0 break-words">{error}</p>
              </div>
            )}

            {hasRows && (
              <section aria-label="客戶資料預覽" className="space-y-4">
                <div role="status" aria-live="polite" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: '檔案總筆數', value: vm.rows.length, tone: 'text-[#263d37]' },
                    {
                      label: resultStage ? '匯入成功' : '可匯入',
                      value: resultStage ? successes : ready,
                      tone: 'text-[#315740]',
                    },
                    { label: '需確認', value: issues, tone: issues ? 'text-amber-700' : 'text-muted-foreground' },
                    { label: '已略過', value: skipped, tone: 'text-muted-foreground' },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-[#e5e9e1] bg-white px-4 py-3">
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className={cn('mt-1 text-2xl font-semibold tabular-nums', stat.tone)}>
                        {stat.value}
                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">筆</span>
                      </p>
                    </div>
                  ))}
                </div>
                <div className="overflow-hidden rounded-xl border border-[#e1e7dc] bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
                    <h3 className="text-sm font-semibold text-[#263d37]">
                      {resultStage ? '匯入結果' : '資料預覽'}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">{visibleRows.length} 筆</span>
                    </h3>
                    <div className="flex gap-1 rounded-lg bg-muted/60 p-1" aria-label="篩選匯入資料">
                      {(
                        [
                          { key: 'all', label: '全部' },
                          { key: 'issues', label: `需確認 ${issues}` },
                          { key: 'skipped', label: `已略過 ${skipped}` },
                        ] as const
                      ).map((item) => (
                        <Button
                          key={item.key}
                          type="button"
                          size="xs"
                          variant="ghost"
                          aria-pressed={filter === item.key}
                          className={
                            filter === item.key ? 'bg-white text-[#315740] shadow-sm' : 'text-muted-foreground'
                          }
                          onClick={() => setFilter(item.key)}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div
                    className="max-h-[34vh] overflow-auto"
                    tabIndex={0}
                    role="region"
                    aria-label="客戶匯入預覽與結果"
                  >
                    <table className="w-full min-w-[760px] table-fixed text-left text-xs">
                      <caption className="sr-only">客戶匯入預覽與逐列結果</caption>
                      <colgroup>
                        <col className="w-[7%]" />
                        <col className="w-[25%]" />
                        <col className="w-[25%]" />
                        <col className="w-[15%]" />
                        <col className="w-[28%]" />
                      </colgroup>
                      <thead className="sticky top-0 z-10 bg-[#f7f9f5]">
                        <tr>
                          {['CSV 列', '客戶／公司', '聯絡資訊', '客戶所有者', '檢查結果'].map((label) => (
                            <th key={label} className="px-4 py-3 font-medium text-muted-foreground">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {visibleRows.map((row) => {
                          const status = statuses[row.status];
                          const Icon = status.icon;
                          return (
                            <tr
                              key={row.rowNumber}
                              className="border-t border-[#edf0e9] align-top transition-colors hover:bg-[#fafbf9]"
                            >
                              <td className="px-4 py-4 tabular-nums text-muted-foreground">{row.rowNumber}</td>
                              <td className="px-4 py-4 [overflow-wrap:anywhere]">
                                <p className="font-medium text-[#263d37]">{row.customer.name || '未填寫名稱'}</p>
                                <p className="mt-1 text-muted-foreground">{row.customer.company || '—'}</p>
                              </td>
                              <td className="space-y-1 px-4 py-4 text-muted-foreground [overflow-wrap:anywhere]">
                                <p>{row.customer.email || '—'}</p>
                                <p>{row.customer.phone || '—'}</p>
                              </td>
                              <td className="px-4 py-4 text-muted-foreground [overflow-wrap:anywhere]">
                                {row.customer.owner || '—'}
                              </td>
                              <td className="px-4 py-4">
                                <span
                                  className={cn(
                                    'inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-medium ring-1 ring-inset',
                                    status.color
                                  )}
                                >
                                  <Icon className="size-3" />
                                  {status.label}
                                </span>
                                {row.messages.map((message) => (
                                  <p
                                    key={message}
                                    className="mt-2 leading-relaxed text-muted-foreground [overflow-wrap:anywhere]"
                                  >
                                    {message}
                                  </p>
                                ))}
                              </td>
                            </tr>
                          );
                        })}
                        {!visibleRows.length && (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                              沒有符合條件的資料
                              <Button type="button" variant="link" size="sm" onClick={() => setFilter('all')}>
                                顯示全部
                              </Button>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}
            {vm.isImporting && (
              <p role="status" className="flex items-center gap-2 text-xs text-muted-foreground">
                <LoaderCircle className="size-3.5 animate-spin" />
                正在匯入，請勿關閉此頁面或重新整理。
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[#e7ebe3] bg-white px-5 py-4 sm:px-7">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="size-3.5 text-[#56775e]" />
              僅新增客戶，不覆寫現有資料
            </p>
            <div className="ml-auto flex items-center gap-2">
              {!finished && (
                <Button type="button" variant="outline" disabled={vm.isImporting} onClick={() => vm.changeOpen(false)}>
                  取消
                </Button>
              )}
              {finished ? (
                <Button
                  type="button"
                  className="bg-[#254e3c] px-5 text-white hover:bg-[#193d2d]"
                  onClick={() => vm.changeOpen(false)}
                >
                  完成
                  <Check />
                </Button>
              ) : (
                <Button
                  type="button"
                  className="bg-[#254e3c] px-5 text-white hover:bg-[#193d2d]"
                  disabled={
                    busy || vm.rateLimit.remainingSeconds > 0 || !!selectionError || (!ready && vm.phase !== 'retry')
                  }
                  onClick={() => {
                    if (can('customers.create')) void vm.startImport();
                  }}
                >
                  {busy ? <LoaderCircle className="animate-spin" /> : <Upload />}
                  {vm.rateLimit.message ||
                    (vm.isImporting
                      ? '正在匯入…'
                      : vm.phase === 'reading'
                        ? '正在檢查…'
                        : vm.phase === 'retry'
                          ? '重新取得匯入結果'
                          : ready
                            ? `確認匯入 ${ready} 筆`
                            : hasRows
                              ? '沒有可匯入的資料'
                              : '請先選擇檔案')}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
