import type { ProductResponse } from '../../../api/Api';
import type { QuoteContent, QuoteLine } from './quote-types';

export function selectQuoteProduct(line: QuoteLine, product: ProductResponse): QuoteLine {
  if (line.productId === product.id) return line;
  return { ...line, productId: product.id, productName: product.name, sku: product.sku,
    catalogPrice: product.price, unitPrice: Number.NaN };
}

export function changeQuoteCurrency(content: QuoteContent, currency: string): QuoteContent {
  if (content.currency === currency) return content;
  return { ...content, currency, lines: content.lines.map(line => ({ ...line, unitPrice: Number.NaN })) };
}
