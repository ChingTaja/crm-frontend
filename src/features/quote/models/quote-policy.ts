import type { QuoteActor, QuoteContent, QuoteLine, QuoteTotals, QuoteVersion } from './quote-types'

export const quotePolicy = { discountThresholdPercent: 10, totalThreshold: 100000, currency: 'TWD', timeZone: 'Asia/Taipei' } as const
// Local editing works without an identity until authentication is connected.
// An absent identity never grants approval or customer-decision permissions.
export const canManageQuote = (actor: QuoteActor | null) => actor === null || (!!actor.id && actor.role === 'sales')
export function quoteToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: quotePolicy.timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now)
  const get = (type: string) => parts.find(part => part.type === type)?.value
  return `${get('year')}-${get('month')}-${get('day')}`
}
export function quoteLineTotals(line: QuoteLine): QuoteTotals {
  const subtotalCents = Math.round(line.unitPrice * 100) * line.quantity
  const discountCents = Math.round(subtotalCents * Math.round(line.discountPercent * 100) / 10000)
  const taxCents = Math.round((subtotalCents - discountCents) * Math.round(line.taxPercent * 100) / 10000)
  return { subtotalCents, discountCents, taxCents, totalCents: subtotalCents - discountCents + taxCents }
}
export function quoteTotals(lines: QuoteLine[]): QuoteTotals {
  return lines.reduce((sum, line) => {
    const value = quoteLineTotals(line)
    return { subtotalCents: sum.subtotalCents + value.subtotalCents, discountCents: sum.discountCents + value.discountCents, taxCents: sum.taxCents + value.taxCents, totalCents: sum.totalCents + value.totalCents }
  }, { subtotalCents: 0, discountCents: 0, taxCents: 0, totalCents: 0 })
}
export const requiresQuoteApproval = (content: QuoteContent) => content.lines.some(line => line.discountPercent > quotePolicy.discountThresholdPercent) || quoteTotals(content.lines).totalCents > quotePolicy.totalThreshold * 100
export const canEditQuote = (version: QuoteVersion) => version.status === 'Draft' && !['Pending', 'Approved'].includes(version.approval)
export const money = (cents: number) => new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 2 }).format(Number.isFinite(cents) ? cents / 100 : 0)
export function validateQuoteContent(content: QuoteContent, today: string) {
  if (!content.name.trim()) throw new Error('請輸入報價名稱。')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(content.validUntil) || Number.isNaN(Date.parse(content.validUntil)) || new Date(content.validUntil).toISOString().slice(0, 10) !== content.validUntil) throw new Error('請選擇有效的報價期限。')
  if (content.validUntil < today) throw new Error('有效期限不得早於今天。')
  if (!content.lines.length) throw new Error('請加入至少一筆商品。')
  for (const line of content.lines) {
    if (!line.productId || !line.productName.trim()) throw new Error('請選擇每筆明細的商品。')
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 1000000) throw new Error('數量須為 1 至 1,000,000 的整數。')
    for (const value of [line.unitPrice, line.catalogPrice, line.discountPercent, line.taxPercent]) {
      if (!Number.isFinite(value) || value < 0 || Math.abs(value * 100 - Math.round(value * 100)) > 0.00001) throw new Error('價格、折扣及稅率須為非負數，最多兩位小數。')
    }
    if (line.discountPercent > 100 || line.taxPercent > 100) throw new Error('折扣與稅率不可超過 100%。')
    if (!Number.isSafeInteger(quoteLineTotals(line).totalCents) || !Number.isSafeInteger(quoteLineTotals(line).subtotalCents)) throw new Error('金額過大，請調整。')
  }
  if (!Number.isSafeInteger(quoteTotals(content.lines).totalCents)) throw new Error('總金額過大。')
}
