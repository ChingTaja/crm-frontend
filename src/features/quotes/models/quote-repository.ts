import { customerRepository } from '../../customers/models/customer-model'
import { productRepository, opportunityRepository, orderRepository } from '../../sales/models/sales-model'
import { canEditQuote, quoteToday, requiresQuoteApproval, validateQuoteContent, quoteTotals } from './quote-policy'
import type { Quote, QuoteActor, QuoteAudit, QuoteContent, QuoteVersion } from './quote-types'

const systemActor: QuoteActor = { id: 'system', name: '系統', role: 'system' }
function freeze<T>(value: T): T {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value) }
  return value
}
export function createQuoteRepository(deps = { customers: customerRepository, products: productRepository, opportunities: opportunityRepository, orders: orderRepository }, now = () => new Date()) {
  let quotes: Quote[] = []
  let sequence = 0
  const listeners = new Set<() => void>()
  const notify = () => listeners.forEach(listener => listener())
  const audit = (version: number, actor: QuoteActor, action: string, detail = ''): QuoteAudit => ({ id: crypto.randomUUID(), at: now().toISOString(), actorId: actor.id, actorName: actor.name, action, version, detail })
  function role(actor: QuoteActor, required: QuoteActor['role']) {
    if (!actor.id || actor.role !== required) throw new Error(`此操作需要${required === 'manager' ? '主管' : required === 'customer' ? '客戶' : '業務'}身分。`)
  }
  function commit(quote: Quote) {
    const stored = freeze(structuredClone(quote))
    quotes = quotes.some(item => item.id === stored.id) ? quotes.map(item => item.id === stored.id ? stored : item) : [stored, ...quotes]
    notify()
    return stored
  }
  function expire() {
    let changed = false
    const today = quoteToday(now())
    quotes = quotes.map(quote => {
      const events: QuoteAudit[] = []
      const versions = quote.versions.map(version => {
        if (['Draft', 'Sent'].includes(version.status) && version.validUntil < today) {
          changed = true
          events.push(audit(version.version, systemActor, '報價過期', `有效期限 ${version.validUntil}`))
          return { ...version, status: 'Expired' as const, revision: version.revision + 1 }
        }
        return version
      })
      return events.length ? freeze({ ...quote, versions, audit: [...quote.audit, ...events] }) : quote
    })
    if (changed) notify()
  }
  function current(id: string, versionId: string) {
    expire()
    const quote = quotes.find(item => item.id === id)
    if (!quote) throw new Error('找不到報價單。')
    const version = quote.versions[quote.versions.length - 1]!
    if (version.id !== versionId) throw new Error('歷史版本僅供查閱，請切換到最新版本。')
    return { quote, version }
  }
  function content(input: QuoteContent, previous?: QuoteVersion): QuoteContent {
    const value = structuredClone(input)
    if (!deps.customers.getSnapshot().some(item => item.id === value.customerId)) throw new Error('請選擇有效的客戶。')
    if (value.opportunityId && !deps.opportunities.getSnapshot().some(item => item.id === value.opportunityId && item.customerId === value.customerId)) throw new Error('來源商機必須屬於所選客戶。')
    value.name = value.name.trim()
    value.lines = value.lines.map(line => {
      const old = previous?.lines.find(item => item.id === line.id && item.productId === line.productId)
      const product = deps.products.getSnapshot().find(item => item.id === line.productId)
      if (!product || (!old && product.status !== '啟用')) throw new Error('請選擇啟用中的商品。')
      return { ...line, productName: old?.productName ?? product.name, sku: old?.sku ?? product.sku, catalogPrice: old?.catalogPrice ?? product.price }
    })
    if (new Set(value.lines.map(line => line.id)).size !== value.lines.length) throw new Error('明細識別碼不可重複。')
    validateQuoteContent(value, quoteToday(now()))
    return value
  }
  function change(quote: Quote, version: QuoteVersion, actor: QuoteActor, action: string, patch: Partial<QuoteVersion>, detail = '') {
    return commit({ ...quote, versions: quote.versions.map(item => item.id === version.id ? { ...item, ...patch, revision: item.revision + 1 } : item), audit: [...quote.audit, audit(version.version, actor, action, detail)] })
  }
  return {
    getSnapshot: () => quotes,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } },
    expire,
    create(input: QuoteContent, actor: QuoteActor) {
      role(actor, 'sales')
      const data = content(input)
      const version: QuoteVersion = { ...data, id: crypto.randomUUID(), version: 1, revision: 0, status: 'Draft', approval: requiresQuoteApproval(data) ? 'Required' : 'NotRequired', createdAt: now().toISOString(), createdBy: actor.name }
      return commit({ id: crypto.randomUUID(), number: `QT-${String(++sequence).padStart(5, '0')}`, versions: [version], audit: [audit(1, actor, '建立報價')] })
    },
    update(id: string, versionId: string, expectedRevision: number, input: QuoteContent, actor: QuoteActor) {
      role(actor, 'sales')
      const { quote, version } = current(id, versionId)
      if (!canEditQuote(version)) throw new Error('此版本已鎖定，請建立新版本後修改。')
      if (version.revision !== expectedRevision) throw new Error('報價已更新，請重新載入此版本。')
      const data = content(input, version)
      return change(quote, version, actor, '修改報價', { ...data, approval: (version.requiresReapproval || requiresQuoteApproval(data)) ? 'Required' : 'NotRequired', approvalAt: undefined, approvalBy: undefined, approvalReason: undefined })
    },
    newVersion(id: string, versionId: string, actor: QuoteActor) {
      role(actor, 'sales')
      const { quote, version } = current(id, versionId)
      if (quote.orderId || version.status === 'Accepted') throw new Error('客戶已接受的報價不可新增版本。')
      if (version.approval === 'Pending') throw new Error('請等待審批完成後再建立版本。')
      const next: QuoteVersion = { ...structuredClone(version), id: crypto.randomUUID(), version: version.version + 1, revision: 0, status: 'Draft', requiresReapproval: version.approval !== 'NotRequired' || version.requiresReapproval, approval: version.approval !== 'NotRequired' || version.requiresReapproval || requiresQuoteApproval(version) ? 'Required' : 'NotRequired', createdAt: now().toISOString(), createdBy: actor.name, validUntil: version.validUntil < quoteToday(now()) ? quoteToday(now()) : version.validUntil, sentAt: undefined, decisionAt: undefined, decisionBy: undefined, decisionReason: undefined, approvalAt: undefined, approvalBy: undefined, approvalReason: undefined }
      return commit({ ...quote, versions: [...quote.versions, next], audit: [...quote.audit, audit(next.version, actor, '建立新版本', `複製自 v${version.version}；需重新審批`)] })
    },
    requestApproval(id: string, versionId: string, actor: QuoteActor) {
      role(actor, 'sales')
      const { quote, version } = current(id, versionId)
      if (version.status !== 'Draft' || !['Required', 'Rejected'].includes(version.approval)) throw new Error('目前版本無法提交審批。')
      content(version, version)
      return change(quote, version, actor, '提交審批', { approval: 'Pending', approvalReason: undefined })
    },
    review(id: string, versionId: string, approved: boolean, reason: string, actor: QuoteActor) {
      role(actor, 'manager')
      const { quote, version } = current(id, versionId)
      if (version.status !== 'Draft' || version.approval !== 'Pending') throw new Error('此版本不是待審批狀態。')
      if (!approved && !reason.trim()) throw new Error('拒絕審批必須填寫原因。')
      return change(quote, version, actor, approved ? '批准報價' : '拒絕審批', { approval: approved ? 'Approved' : 'Rejected', approvalBy: actor.name, approvalAt: now().toISOString(), approvalReason: reason.trim() }, reason.trim())
    },
    send(id: string, versionId: string, actor: QuoteActor) {
      role(actor, 'sales')
      const { quote, version } = current(id, versionId)
      if (version.status !== 'Draft' || !['Approved', 'NotRequired'].includes(version.approval)) throw new Error('請先完成審批，才能送出報價。')
      content(version, version)
      if ((version.requiresReapproval || requiresQuoteApproval(version)) && version.approval !== 'Approved') throw new Error('此報價需主管批准。')
      return change(quote, version, actor, '送出報價', { status: 'Sent', sentAt: now().toISOString() }, '前端模擬送出，未寄送郵件')
    },
    decide(id: string, versionId: string, accepted: boolean, reason: string, actor: QuoteActor) {
      role(actor, 'customer')
      const { quote, version } = current(id, versionId)
      if (version.status !== 'Sent') throw new Error('只有有效期限內的已送出報價可接受或拒絕。')
      if (!accepted && !reason.trim()) throw new Error('拒絕報價必須填寫原因。')
      return change(quote, version, actor, accepted ? '客戶接受' : '客戶拒絕', { status: accepted ? 'Accepted' : 'Rejected', decisionAt: now().toISOString(), decisionBy: actor.name, decisionReason: reason.trim() }, reason.trim())
    },
    convertToOrder(id: string, versionId: string, actor: QuoteActor) {
      role(actor, 'sales')
      const { quote, version } = current(id, versionId)
      if (version.status !== 'Accepted') throw new Error('只有已接受的報價可轉換訂單。')
      if (quote.orderId) return quote.orderId
      const totals = quoteTotals(version.lines)
      const order = deps.orders.save({ id: '', name: `${quote.number} v${version.version} 訂單`, customerId: version.customerId, opportunityId: version.opportunityId,
        items: version.lines.map(line => ({ productId: line.productId, quantity: line.quantity, unitPrice: line.unitPrice })), status: '草稿',
        quoteSource: { quoteId: quote.id, number: quote.number, version: version.version, lines: structuredClone(version.lines), totals, paymentTerms: version.paymentTerms, deliveryTerms: version.deliveryTerms, warranty: version.warranty, notes: version.notes } })
      commit({ ...quote, orderId: order.id, audit: [...quote.audit, audit(version.version, actor, '轉換訂單', order.id)] })
      return order.id
    },
  }
}
export const quoteRepository = createQuoteRepository()
