import { isLeadReviewed } from '../models/lead-model';
import { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { disqualificationReasons } from '../models/lead-qualification';
import { useLeadQualification } from '../view-models/use-lead-qualification';
import type { Lead } from '../../../api/Api';

function QualificationForm({
  lead,
  onClose,
  onBusy,
}: {
  lead: Lead;
  onClose: () => void;
  onBusy: (busy: boolean) => void;
}) {
  const vm = useLeadQualification(lead, onClose, onBusy);
  const converted = !!lead.qualification?.customerId;
  return (
    <form className="mt-5 space-y-5" onSubmit={vm.submit} aria-busy={vm.isSubmitting}>
      <fieldset disabled={vm.isSubmitting} className="space-y-5">
        <fieldset className="space-y-3">
          <legend className="mb-2 text-sm font-medium">審核結果</legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="decision"
              checked={vm.decision === 'approved'}
              onChange={() => vm.setDecision('approved')}
            />
            通過審核
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="decision"
              checked={vm.decision === 'rejected'}
              disabled={converted}
              onChange={() => vm.setDecision('rejected')}
            />
            不符合資格
          </label>
        </fieldset>
        {vm.decision === 'approved' ? (
          <fieldset className="space-y-3 rounded-lg border bg-muted/20 p-4">
            <legend className="px-1 text-sm font-medium">轉換方式</legend>
            <label className="flex items-start gap-2 text-sm">
              <input
                className="mt-1"
                type="radio"
                name="conversion"
                checked={!vm.createOpportunity}
                onChange={() => vm.setCreateOpportunity(false)}
              />
              <span>
                建立客戶與聯絡人
                <br />
                <small className="text-muted-foreground">Customer ＋ Contact</small>
              </span>
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input
                className="mt-1"
                type="radio"
                name="conversion"
                checked={vm.createOpportunity}
                onChange={() => vm.setCreateOpportunity(true)}
              />
              <span>
                建立客戶、聯絡人與商機
                <br />
                <small className="text-muted-foreground">Customer ＋ Contact ＋ Opportunity</small>
              </span>
            </label>
            {converted && <p className="text-xs text-muted-foreground">已轉換的資料會沿用，不會重複建立。</p>}
          </fieldset>
        ) : (
          <div className="space-y-3">
            <Label htmlFor="rejection-reason">不符合資格原因（選填）</Label>
            <select
              id="rejection-reason"
              className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
              value={vm.reason}
              onChange={(event) => vm.setReason(event.target.value)}
            >
              <option value="">請選擇原因</option>
              {disqualificationReasons.map((reason) => (
                <option key={reason}>{reason}</option>
              ))}
            </select>
          </div>
        )}
        <div className="space-y-3">
          <Label htmlFor="qualification-note">補充說明（選填）</Label>
          <textarea
            id="qualification-note"
            className="min-h-24 w-full rounded-lg border bg-background p-3 text-sm"
            value={vm.note}
            onChange={(event) => vm.setNote(event.target.value)}
          />
        </div>
      </fieldset>
      {vm.error && (
        <p role="alert" className="text-sm text-destructive">
          {vm.error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" disabled={vm.isSubmitting} onClick={onClose}>
          取消
        </Button>
        <Button type="submit" disabled={vm.isSubmitting}>
          {vm.isSubmitting ? '審核中…' : '確認審核'}
        </Button>
      </div>
    </form>
  );
}

export function LeadQualificationDialog({ lead, disabled }: { lead: Lead; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const reviewed = isLeadReviewed(lead.status);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={disabled || reviewed}
        title={reviewed ? '此 Lead 已完成資格審核' : disabled ? '請先儲存修改，再進行資格審核' : '資格審核'}
        onClick={() => setOpen(true)}
      >
        <ClipboardCheck />
        資格審核
      </Button>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!busy) setOpen(value);
        }}
      >
        <DialogContent>
          <DialogTitle className="text-lg font-semibold">資格審核</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">
            審核 Lead「{lead.name}」，並選擇後續處理方式。
          </DialogDescription>
          {open && <QualificationForm lead={lead} onClose={() => setOpen(false)} onBusy={setBusy} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
