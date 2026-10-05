import type { QuoteVersionResponse } from '../../../api/Api';
export type {
  ReviewerOption,
  RequestApprovalRequest as RequestQuoteReview,
  QuoteResponse as AssignedQuoteResponse,
} from '../../../api/Api';
export type ReviewAssignment = Pick<
  QuoteVersionResponse,
  'reviewerId' | 'reviewerName' | 'approvalRequestedBy' | 'approvalRequestedAt' | 'allowedActions'
>;
export function canReviewAssignment(
  version: ReviewAssignment & { approval?: string; status?: string },
  actorId: string | undefined,
  action: 'approve' | 'reject-approval'
) {
  return (
    !!actorId &&
    version.reviewerId === actorId &&
    version.approval === 'Pending' &&
    version.status === 'Draft' &&
    !!version.allowedActions?.includes(action)
  );
}
