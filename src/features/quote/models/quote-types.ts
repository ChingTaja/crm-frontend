import type { ReviewAssignment } from './quote-review-contract';
import type {
  QuoteLineResponse,
  QuoteVersionResponse,
  CreateQuoteRequest,
  QuoteTotals as ApiQuoteTotals,
} from '../../../api/Api';
export type QuoteStatus = NonNullable<QuoteVersionResponse['status']>;
export type ApprovalStatus = NonNullable<QuoteVersionResponse['approval']>;
export type QuoteActor = {
  id: string;
  name: string;
  permissionCodes?: string[];
};
export type QuoteLine = Required<QuoteLineResponse>;
export type QuoteContent = Required<Omit<CreateQuoteRequest, 'lines'>> & { lines: QuoteLine[] };
export interface QuoteVersion extends QuoteContent, ReviewAssignment {
  totals?: ApiQuoteTotals;
  id: string;
  version: number;
  revision: number;
  status: QuoteStatus;
  requiresReapproval?: boolean;
  approval: ApprovalStatus;
  createdAt: string;
  createdBy?: string;
  sentAt?: string;
  approvalBy?: string;
  approvalAt?: string;
  approvalReason?: string;
  decisionAt?: string;
  decisionBy?: string;
  decisionReason?: string;
}
export interface QuoteAudit {
  id: string;
  at: string;
  actorId?: string;
  actorName?: string;
  action: string;
  version: number;
  detail: string;
}
export interface Quote {
  id: string;
  number: string;
  versions: QuoteVersion[];
  audit: QuoteAudit[];
  orderId?: string;
}
export interface QuoteTotals {
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
}
