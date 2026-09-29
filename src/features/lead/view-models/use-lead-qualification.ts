import { qualificationRequest } from '../models/lead-qualification-request';
import { useRef, useState, type FormEvent } from 'react';
import type { Lead, QualifyLeadRequest } from '../../../api/Api';
import { useApi } from '@/hooks/use-api';
import { leadApi } from '../models/lead-service';
import { cacheLead, isLeadReviewed } from '../models/lead-model';

export function useLeadQualification(lead: Lead, onComplete: () => void, onBusy: (busy: boolean) => void) {
  const [decision, setDecision] = useState<QualifyLeadRequest['decision']>('approved');
  const [createOpportunity, setCreateOpportunity] = useState(false);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [validationError, setValidationError] = useState('');
  const request = useApi(leadApi.qualify);
  const busy = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    if (isLeadReviewed(lead.status)) {
      setValidationError('此 Lead 已完成資格審核。');
      return;
    }
    if (!lead.id) {
      setValidationError('請先儲存 Lead，再進行審核。');
      return;
    }
    busy.current = true;
    onBusy(true);
    setValidationError('');
    const payload = qualificationRequest(decision, createOpportunity, reason, note);
    try {
      const saved = await request.execute(lead.id, payload);
      cacheLead(saved);
      onComplete();
    } catch {
      /* useApi exposes the server error and retains the form values. */
    } finally {
      busy.current = false;
      onBusy(false);
    }
  }
  return {
    decision,
    setDecision,
    createOpportunity,
    setCreateOpportunity,
    reason,
    setReason,
    note,
    setNote,
    submit,
    isSubmitting: request.isLoading,
    error: validationError || request.error?.message,
  };
}
