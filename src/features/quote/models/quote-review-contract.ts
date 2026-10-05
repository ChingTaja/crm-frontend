import type { QuoteActionRequest, QuoteVersionResponse, QuoteResponse } from '../../../api/Api';
// Pending backend contract: replace these extensions with generated types after OpenAPI is updated.
export interface ReviewerOption { id: string; username: string; displayName?: string }
export interface RequestQuoteReview extends QuoteActionRequest { reviewerId: string }
export interface ReviewAssignment {
  reviewerId?: string;
  reviewerName?: string;
  approvalRequestedAt?: string;
  allowedActions?: string[];
}
export type AssignedQuoteResponse = Omit<QuoteResponse, 'versions'> & { versions?: (QuoteVersionResponse & ReviewAssignment)[] };
export function canReviewAssignment(version: ReviewAssignment & { approval?: string; status?: string }, actorId: string | undefined, action: 'approve' | 'reject-approval') {
  return !!actorId && version.reviewerId === actorId && version.approval === 'Pending' && version.status === 'Draft' && !!version.allowedActions?.includes(action);
}
