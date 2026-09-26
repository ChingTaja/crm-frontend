import { navigate } from '@/lib/router';
import { useState } from 'react'
import { quoteRepository } from '../models/quote-repository'
import { canEditQuote, canManageQuote, quoteToday } from '../models/quote-policy'
import type { Product } from '../../product/models/product-model';
import type { Quote, QuoteActor, QuoteContent, QuoteLine, QuoteVersion } from '../models/quote-types'

export function useQuoteEditor(actor: QuoteActor | null, quote?: Quote, version?: QuoteVersion) {
  const [initial] = useState<QuoteContent>(() => version ? structuredClone({ name: version.name, customerId: version.customerId, opportunityId: version.opportunityId, validUntil: version.validUntil, lines: version.lines, paymentTerms: version.paymentTerms, deliveryTerms: version.deliveryTerms, warranty: version.warranty, notes: version.notes }) : { name: '', customerId: '', opportunityId: '', validUntil: quoteToday(new Date(Date.now() + 30 * 86400000)), lines: [], paymentTerms: '確認訂單後 30 日內付款', deliveryTerms: '', warranty: '', notes: '' })
  const [draft, setDraft] = useState(initial)
  const [error, setError] = useState('')
  const latest = !quote || quote.versions[quote.versions.length - 1]?.id === version?.id
  const editable = canManageQuote(actor) && latest && (!version || canEditQuote(version))
  const dirty = JSON.stringify(initial) !== JSON.stringify(draft)
  function update<K extends keyof QuoteContent>(field: K, value: QuoteContent[K]) {
    setDraft(current => ({ ...current, [field]: value, ...(field === 'customerId' ? { opportunityId: '' } : {}) })); setError('')
  }
  function updateLine<K extends keyof QuoteLine>(id: string, field: K, value: QuoteLine[K]) {
    setDraft(current => ({ ...current, lines: current.lines.map(line => line.id === id ? { ...line, [field]: value } : line) })); setError('')
  }
  function selectProduct(id: string, product: Product) {
    setDraft(current => ({ ...current, lines: current.lines.map(line => line.id === id && line.productId !== product.id ? { ...line, productId: product.id, productName: product.name, sku: product.sku, catalogPrice: product.price, unitPrice: product.price } : line) }))
  }
  function run(action: () => void) {
    setError('')
    try { action() } catch (error) { setError(error instanceof Error ? error.message : '操作失敗。') }
  }
  function save() {
    run(() => {
      if (!editable) throw new Error('此版本不可修改。')
      if (quote && version) quoteRepository.update(quote.id, version.id, version.revision, draft, actor)
      else { const created = quoteRepository.create(draft, actor); navigate(`/quotes/${created.id}/edit`) }
    })
  }
  return { draft, error, editable, latest, dirty, update, updateLine, selectProduct, save,
    reset: () => { setDraft(structuredClone(initial)); setError('') },
    addLine: () => update('lines', [...draft.lines, { id: crypto.randomUUID(), productId: '', productName: '', sku: '', catalogPrice: 0, quantity: 1, unitPrice: 0, discountPercent: 0, taxPercent: 5 }]),
    removeLine: (id: string) => update('lines', draft.lines.filter(line => line.id !== id)),
  }
}
export type QuoteEditor = ReturnType<typeof useQuoteEditor>
