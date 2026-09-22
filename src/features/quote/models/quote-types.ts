export type QuoteStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired'
export type ApprovalStatus = 'NotRequired' | 'Required' | 'Pending' | 'Approved' | 'Rejected'
export type QuoteActor = { id: string; name: string; role: 'sales' | 'manager' | 'customer' | 'system' }
export interface QuoteLine {
  id: string
  productId: string
  productName: string
  sku: string
  catalogPrice: number
  quantity: number
  unitPrice: number
  discountPercent: number
  taxPercent: number
}
export interface QuoteContent {
  name: string
  customerId: string
  opportunityId: string
  validUntil: string
  lines: QuoteLine[]
  paymentTerms: string
  deliveryTerms: string
  warranty: string
  notes: string
}
export interface QuoteVersion extends QuoteContent {
  id: string
  version: number
  revision: number
  status: QuoteStatus
  requiresReapproval?: boolean
  approval: ApprovalStatus
  createdAt: string
  createdBy?: string
  sentAt?: string
  approvalBy?: string
  approvalAt?: string
  approvalReason?: string
  decisionAt?: string
  decisionBy?: string
  decisionReason?: string
}
export interface QuoteAudit {
  id: string
  at: string
  actorId?: string
  actorName?: string
  action: string
  version: number
  detail: string
}
export interface Quote {
  id: string
  number: string
  versions: QuoteVersion[]
  audit: QuoteAudit[]
  orderId?: string
}
export interface QuoteTotals {
  subtotalCents: number
  discountCents: number
  taxCents: number
  totalCents: number
}
