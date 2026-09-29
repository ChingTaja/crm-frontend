import type { QualifyLeadRequest } from '../../../api/Api';

export function qualificationRequest(
  decision: QualifyLeadRequest['decision'],
  createOpportunity: boolean,
  reason: string,
  note: string
): QualifyLeadRequest {
  return {
    decision,
    ...(decision === 'approved'
      ? { conversionType: createOpportunity ? 'customer_contact_opportunity' : 'customer_contact' }
      : reason.trim()
        ? { reason: reason.trim() }
        : {}),
    ...(note.trim() ? { note: note.trim() } : {}),
  };
}
