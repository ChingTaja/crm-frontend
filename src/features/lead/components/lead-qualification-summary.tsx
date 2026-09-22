import type { Lead } from '../models/lead-model'

export function LeadQualificationSummary({ lead, dirty }: { lead?: Lead; dirty: boolean }) {
  return <>
      {lead && dirty && <p className="pt-3 text-xs text-muted-foreground">請先儲存修改，再進行資格審核。</p>}
      {lead?.qualification && (
        <div role="status" className="mt-4 space-y-2 rounded-lg border bg-muted/30 p-4 text-sm">
          <p>審核結果：{lead.qualification.decision === 'approved' ? '通過審核' : '不符合資格'}</p>
          {lead.qualification.reason && (
            <p>
              原因：{lead.qualification.reason}
              {lead.qualification.note && ` — ${lead.qualification.note}`}
            </p>
          )}
          <div className="flex flex-wrap gap-4">
            {lead.qualification.customerId && (
              <a className="underline" href={`#/customers/${lead.qualification.customerId}/edit`}>
                查看客戶
              </a>
            )}
            {lead.qualification.contactId && (
              <a className="underline" href={`#/contacts/${lead.qualification.contactId}/edit`}>
                查看聯絡人
              </a>
            )}
            {lead.qualification.opportunityId && (
              <a className="underline" href={`#/opportunities/${lead.qualification.opportunityId}/edit`}>
                查看商機
              </a>
            )}
          </div>
        </div>
      )}
  </>
}
