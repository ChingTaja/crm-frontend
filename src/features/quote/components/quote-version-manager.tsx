import { History, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { EntityTable, EntityTableHead, EntityTableCell, EntityTableRow, EntityRowHeading } from '@/components/ui/entity-table'
import { useQuoteVersions } from '../view-models/use-quote-versions'
import type { Quote, QuoteActor } from '../models/quote-types'

interface QuoteVersionManagerProps {
  quote: Quote
  selectedId: string
  actor: QuoteActor | null
  dirty: boolean
  onSelect: (id: string) => void
}

export function QuoteVersionManager({ quote, selectedId, actor, dirty, onSelect }: QuoteVersionManagerProps) {
  const vm = useQuoteVersions(quote, selectedId, actor, dirty, onSelect)
  return (
    <Card>
      <CardHeader className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <CardTitle className="flex items-center gap-2"><History size={18} />版本管理 · {quote.versions.length} 個版本</CardTitle>
          <CardDescription>新版本會複製最新的 v{vm.latestNumber}，並保留在這張報價單中。點選版本即可查看下方內容。</CardDescription>
        </div>
        <Button type="button" variant="outline" disabled={!!vm.blockedReason} onClick={vm.createVersion}>
          <Plus />建立 v{vm.nextNumber}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {vm.blockedReason && <p className="text-xs text-muted-foreground">{vm.blockedReason}</p>}
        <div className="max-h-80 overflow-y-auto rounded-lg border">
          <EntityTable>
            <caption className="sr-only">{quote.number} 的所有報價版本</caption>
            <thead><tr>{['版本', '狀態', '審批', '含稅總額', '有效期限', '建立資訊', '操作'].map(label => <EntityTableHead key={label}>{label}</EntityTableHead>)}</tr></thead>
            <tbody>{vm.rows.map(row => (
              <EntityTableRow key={row.id} data-selected={row.selected}>
                <EntityRowHeading>
                  <span className="font-medium">v{row.number}</span>
                  {row.latest && <span className="ml-2 rounded bg-muted px-2 py-1 text-xs text-muted-foreground">最新</span>}
                </EntityRowHeading>
                <EntityTableCell>{row.status}</EntityTableCell>
                <EntityTableCell>{row.approval}</EntityTableCell>
                <EntityTableCell>{row.total}</EntityTableCell>
                <EntityTableCell>{row.validUntil}</EntityTableCell>
                <EntityTableCell><p>{row.createdAt}</p>{row.createdBy && <p className="mt-1 text-xs text-muted-foreground">{row.createdBy}</p>}</EntityTableCell>
                <EntityTableCell>
                  <Button type="button" variant={row.selected ? 'secondary' : 'ghost'} size="sm" aria-pressed={row.selected} aria-label={`檢視 v${row.number}`} disabled={dirty} onClick={() => vm.select(row.id)}>
                    {row.selected ? '目前檢視' : '檢視版本'}
                  </Button>
                </EntityTableCell>
              </EntityTableRow>
            ))}</tbody>
          </EntityTable>
        </div>
        {vm.error && <p role="alert" className="text-sm text-destructive">{vm.error}</p>}
      </CardContent>
    </Card>
  )
}
