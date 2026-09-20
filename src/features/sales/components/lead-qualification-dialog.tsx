import { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { disqualificationReasons } from '../models/lead-qualification';
import { useLeadQualification } from '../view-models/use-lead-qualification';
import type { Lead } from '../models/sales-model';

function QualificationForm({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const vm = useLeadQualification(lead.id, onClose);
  const converted = !!lead.qualification?.customerId;
  return (
    <form
      className="mt-5 space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        vm.submit();
      }}
    >
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
              <small className="text-muted-foreground">Customer ＋ Contact ＋ Opportunity，完成後前往商機編輯頁</small>
            </span>
          </label>
          {converted && <p className="text-xs text-muted-foreground">已轉換的資料會沿用，不會重複建立。</p>}
        </fieldset>
      ) : (
        <div className="space-y-3">
          <Label htmlFor="rejection-reason">不符合資格原因 *</Label>
          <select
            id="rejection-reason"
            required
            className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
            value={vm.reason}
            onChange={(event) => vm.setReason(event.target.value)}
          >
            <option value="">請選擇原因</option>
            {disqualificationReasons.map((reason) => (
              <option key={reason}>{reason}</option>
            ))}
          </select>
          <Label htmlFor="rejection-note">補充說明{vm.reason === '其他' ? ' *' : ''}</Label>
          <textarea
            id="rejection-note"
            className="min-h-24 w-full rounded-lg border bg-background p-3 text-sm"
            required={vm.reason === '其他'}
            value={vm.note}
            onChange={(event) => vm.setNote(event.target.value)}
          />
        </div>
      )}
      <p role="alert" className="text-sm text-destructive">
        {vm.error}
      </p>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          取消
        </Button>
        <Button type="submit">確認審核</Button>
      </div>
    </form>
  );
}

export function LeadQualificationDialog({ lead, disabled }: { lead: Lead; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        title={disabled ? '請先儲存修改，再進行資格審核' : '資格審核'}
        onClick={() => setOpen(true)}
      >
        <ClipboardCheck />
        資格審核
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle className="text-lg font-semibold">資格審核</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">
            審核 Lead「{lead.name}」，並選擇後續處理方式。
          </DialogDescription>
          {open && <QualificationForm lead={lead} onClose={() => setOpen(false)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
