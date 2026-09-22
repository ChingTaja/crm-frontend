import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { Quote } from '../models/quote-types'

export function QuoteAudit({ quote }: { quote: Quote }) {
  return <Card><CardHeader><CardTitle>操作紀錄 · Audit Log</CardTitle></CardHeader><CardContent>
    <ol className="space-y-4">{[...quote.audit].reverse().map(event => <li key={event.id} className="border-l-2 pl-4 text-sm">
      <p className="font-medium">{event.action} <span className="font-normal text-muted-foreground">· v{event.version}</span></p>
      <p className="mt-1 text-xs text-muted-foreground">{event.actorName && `${event.actorName} · `}{new Date(event.at).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}</p>
      {event.detail && <p className="mt-1 break-all text-xs">{event.detail}</p>}
    </li>)}</ol>
  </CardContent></Card>
}
