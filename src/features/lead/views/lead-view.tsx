import { useEffect } from 'react'
import { useLeadViewModel } from '../view-models/use-lead-view-model'
import { LeadEditView } from './lead-edit-view'
import { EntityWorkspace } from '@/components/layout/entity-workspace'
import { SalesSidebar } from '@/components/layout/sales-sidebar'
import { EntityList } from '@/components/entity/entity-list'
import { Button } from '@/components/ui/button'
import { useApi } from '@/hooks/use-api'
import { leadApi } from '../models/lead-service'
import { cacheLead } from '../models/lead-model'

function RequestError({ error, retry }: { error: Error; retry: () => void }) {
  return <div role="alert" className="flex flex-wrap items-center gap-3 py-6 text-sm text-destructive">
    <span>無法載入潛在客戶：{error.message}</span>
    <Button variant="outline" onClick={retry}>重試</Button>
    <a className="underline" href="#/leads">返回列表</a>
  </div>
}

function LeadListView() {
  const vm = useLeadViewModel()
  if (vm.request.error) return <RequestError error={vm.request.error} retry={vm.request.reload} />
  if (!vm.request.data) return <p role="status" className="py-10 text-muted-foreground">載入潛在客戶…</p>
  return <EntityList vm={vm} dataNotice={null} />
}

function LeadDetailView({ id }: { id: string }) {
  const { data, error, execute, cancel } = useApi(leadApi.get)
  useEffect(() => {
    void execute(id).then(cacheLead).catch(() => {})
    return cancel
  }, [id, execute, cancel])
  if (error) return <RequestError error={error} retry={() => { void execute(id).then(cacheLead).catch(() => {}) }} />
  if (!data) return <p role="status" className="py-10 text-muted-foreground">載入潛在客戶資料…</p>
  return <LeadEditView record={data} />
}

export function LeadView({ recordId }: { recordId?: string }) {
  return <EntityWorkspace sidebar={<SalesSidebar entity="leads" />}>
    {!recordId ? <LeadListView /> : recordId === 'new'
      ? <LeadEditView key="new" /> : <LeadDetailView key={recordId} id={recordId} />}
  </EntityWorkspace>
}
