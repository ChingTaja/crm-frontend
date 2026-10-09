import type { QuoteActor, QuoteContent, QuoteLine, QuoteTotals, QuoteVersion } from './quote-types';

export const quotePolicy = {
  discountThresholdPercent: 10,
  totalThreshold: 100000,
  currency: 'TWD',
  timeZone: 'Asia/Taipei',
} as const;
export const canManageQuote = (actor: QuoteActor | null) =>
  !!actor?.id && !!actor.permissionCodes?.some(code => code.startsWith('quotes.') && code !== 'quotes.read');
export function quoteToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: quotePolicy.timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
export function quoteLineTotals(line: QuoteLine): QuoteTotals {
  const subtotalCents = Math.round(line.unitPrice * 100) * line.quantity;
  const discountCents = Math.round((subtotalCents * Math.round(line.discountPercent * 100)) / 10000);
  const taxCents = Math.round(((subtotalCents - discountCents) * Math.round(line.taxPercent * 100)) / 10000);
  return { subtotalCents, discountCents, taxCents, totalCents: subtotalCents - discountCents + taxCents };
}
export function quoteTotals(lines: QuoteLine[]): QuoteTotals {
  return lines.reduce(
    (sum, line) => {
      const value = quoteLineTotals(line);
      return {
        subtotalCents: sum.subtotalCents + value.subtotalCents,
        discountCents: sum.discountCents + value.discountCents,
        taxCents: sum.taxCents + value.taxCents,
        totalCents: sum.totalCents + value.totalCents,
      };
    },
    { subtotalCents: 0, discountCents: 0, taxCents: 0, totalCents: 0 }
  );
}
export const requiresQuoteApproval = (content: QuoteContent) =>
  content.lines.some((line) => line.discountPercent > quotePolicy.discountThresholdPercent) ||
  quoteTotals(content.lines).totalCents > quotePolicy.totalThreshold * 100;
export const canEditQuote = (version: QuoteVersion) =>
  version.status === 'Draft' && !['Pending', 'Approved'].includes(version.approval);
export const money = (cents: number) =>
  new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 2 }).format(
    Number.isFinite(cents) ? cents / 100 : 0
  );
