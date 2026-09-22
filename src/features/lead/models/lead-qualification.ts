import { customerRepository } from '../../customer/models/customer-model';
import { contactRepository } from '../../contact/models/contact-model';
import { leadRepository } from './lead-model';
import { opportunityRepository } from '../../opportunity/models/opportunity-model';

export const disqualificationReasons = ['無實際需求', '預算不足', '不符合目標客群', '無法聯繫', '其他'] as const;
export type QualificationDecision =
  | { decision: 'approved'; createOpportunity: boolean }
  | { decision: 'rejected'; reason: string; note: string };

// Repository operations are synchronous in this preview; use a backend transaction when integrating APIs.
export function qualifyLead(leadId: string, decision: QualificationDecision) {
  const lead = leadRepository.getSnapshot().find((item) => item.id === leadId);
  if (!lead) throw new Error('找不到要審核的 Lead。');
  const reviewedAt = new Date().toISOString();
  if (decision.decision === 'rejected') {
    if (lead.qualification?.customerId) throw new Error('此 Lead 已轉換，無法改為不符合資格。');
    if (!disqualificationReasons.some((reason) => reason === decision.reason))
      throw new Error('請選擇不符合資格的原因。');
    if (decision.reason === '其他' && !decision.note.trim()) throw new Error('請填寫其他原因。');
    return leadRepository.save({
      ...lead,
      status: '不合格',
      qualification: { decision: 'rejected', reason: decision.reason, note: decision.note.trim(), reviewedAt },
    });
  }
  if (!lead.name.trim()) throw new Error('請先填寫並儲存 Lead 名稱。');
  const previous = lead.qualification;
  const date = reviewedAt.slice(0, 10);
  const customerId =
    previous?.customerId ??
    customerRepository.create({
      name: lead.company.trim() || lead.name.trim(),
      industry: '',
      owner: lead.owner,
      address: '',
      createdAt: date,
    }).id;
  const contactId =
    previous?.contactId ??
    contactRepository.create({
      customerId,
      name: lead.name.trim(),
      title: '',
      email: lead.email,
      phone: lead.phone,
      createdAt: date,
    }).id;
  const opportunityId =
    previous?.opportunityId ??
    (decision.createOpportunity
      ? opportunityRepository.save({
          id: '',
          name: `${lead.company.trim() || lead.name.trim()}－新商機`,
          customerId,
          leadId: lead.id,
          owner: lead.owner,
          amount: 0,
          expectedCloseDate: '',
          stage: '需求確認',
        }).id
      : undefined);
  return leadRepository.save({
    ...lead,
    status: '已合格',
    qualification: { decision: 'approved', reviewedAt, customerId, contactId, opportunityId },
  });
}
