import type { OpportunityResponse } from '../../../api/Api';
import type { QuoteActor } from './quote-types';

export function quoteCreationBlockedReason(opportunity: OpportunityResponse | undefined, actor: QuoteActor | null): string {
  if (!actor?.id || !actor.permissionCodes?.includes('quotes.create') || !actor.permissionCodes.includes('opportunities.read'))
    return '沒有新增報價所需的權限。';
  if (!opportunity?.id) return '無法確認來源商機，請重新載入。';
  if (!opportunity.createdById) return '商機建立者待確認，目前無法新增報價單。';
  if (opportunity.createdById !== actor.id) return '只有商機建立者可以新增報價單。';
  if (opportunity.closedAt || !['需求討論中', '需求確認', '提案報價', '協商中'].includes(opportunity.stage ?? ''))
    return '商機已結案，無法新增報價單。';
  return '';
}

export function hasQuoteAction(version: { allowedActions?: string[] } | undefined, action: string) {
  return !!version?.allowedActions?.includes(action);
}

export function quoteOperationPermissions(version: { allowedActions?: string[] } | undefined) {
  return {
    canUpdate: hasQuoteAction(version, 'update'),
    canCreateVersion: hasQuoteAction(version, 'new-version'),
    canRequest: hasQuoteAction(version, 'request-approval'),
    canSend: hasQuoteAction(version, 'send'),
    canDecide: hasQuoteAction(version, 'record-decision'),
    canConvert: hasQuoteAction(version, 'convert-to-order'),
    canDelete: hasQuoteAction(version, 'delete'),
    canReview: hasQuoteAction(version, 'approve'),
    canRejectReview: hasQuoteAction(version, 'reject-approval'),
  };
}
