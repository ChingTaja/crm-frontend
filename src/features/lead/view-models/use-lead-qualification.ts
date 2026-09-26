import { navigate } from '@/lib/router';
import { useRef, useState } from 'react';
import { qualifyLead, type QualificationDecision } from '../models/lead-qualification';

export function useLeadQualification(leadId: string, onComplete: () => void) {
  const [decision, setDecision] = useState<'approved' | 'rejected'>('approved');
  const [createOpportunity, setCreateOpportunity] = useState(false);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const busy = useRef(false);
  function submit() {
    if (busy.current) return;
    busy.current = true;
    try {
      const request: QualificationDecision =
        decision === 'approved' ? { decision, createOpportunity } : { decision, reason, note };
      const result = qualifyLead(leadId, request);
      onComplete();
      if (decision === 'approved' && createOpportunity && result.qualification?.opportunityId) {
        navigate(`/opportunities/${result.qualification.opportunityId}/edit`);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '審核失敗，請重試。');
    } finally {
      busy.current = false;
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
    error,
    submit,
  };
}
