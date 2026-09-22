import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadDomainModules } from './helpers/load-domain-modules.mjs'

const [{ createQuoteRepository }, { quoteTotals, requiresQuoteApproval, quoteToday }, { orderRepository }] = loadDomainModules([
  'features/quote/models/quote-repository',
  'features/quote/models/quote-policy',
  'features/order/models/order-model',
])

const sales = { id: 'test-sales', name: '測試業務', role: 'sales' }
const manager = { id: 'test-manager', name: '測試主管', role: 'manager' }
const customer = { id: 'test-customer', name: '測試客戶', role: 'customer' }
const latest = quote => quote.versions[quote.versions.length - 1]
const content = (line = {}, fields = {}) => ({
  name: '年度報價', customerId: 'c1', opportunityId: 'op1', validUntil: '2026-09-20',
  lines: [{ id: 'line1', productId: 'p1', productName: '商品', sku: 'SKU-1', catalogPrice: 1000, quantity: 1, unitPrice: 1000, discountPercent: 0, taxPercent: 5, ...line }],
  paymentTerms: '30 日付款', deliveryTerms: '確認後交貨', warranty: '一年', notes: '備註', ...fields,
})
function setup(orderStore) {
  let clock = new Date('2026-09-20T10:00:00+08:00')
  const products = [{ id: 'p1', name: '商品', sku: 'SKU-1', price: 1000, status: '啟用' }]
  const orders = []
  const repo = createQuoteRepository({
    customers: { getSnapshot: () => [{ id: 'c1' }] },
    products: { getSnapshot: () => products },
    opportunities: { getSnapshot: () => [{ id: 'op1', customerId: 'c1' }, { id: 'op2', customerId: 'c2' }] },
    orders: orderStore ?? { save: order => { const saved = { ...order, id: `order-${orders.length + 1}` }; orders.push(saved); return saved } },
  }, () => clock)
  return { repo, products, orders, now: date => { clock = new Date(date) } }
}

test('approval uses strict > 10% OR tax-inclusive > NT$100,000', () => {
  assert.equal(requiresQuoteApproval(content({ discountPercent: 10 })), false)
  assert.equal(requiresQuoteApproval(content({ discountPercent: 10.01 })), true)
  assert.equal(requiresQuoteApproval(content({ unitPrice: 100000, taxPercent: 0 })), false)
  assert.equal(requiresQuoteApproval(content({ unitPrice: 100000.01, taxPercent: 0 })), true)
  assert.equal(requiresQuoteApproval(content({ unitPrice: 100000, taxPercent: 5 })), true)
  const { repo } = setup()
  assert.equal(latest(repo.create(content({ unitPrice: 100000 }), sales)).approval, 'Required')
})

test('round each discounted line and tax to cents, then sum lines', () => {
  const line = content({ quantity: 3, unitPrice: 19.99, discountPercent: 10, taxPercent: 5 }).lines[0]
  assert.deepEqual(quoteTotals([line]), { subtotalCents: 5997, discountCents: 600, taxCents: 270, totalCents: 5667 })
  assert.deepEqual(quoteTotals([line, line]), { subtotalCents: 11994, discountCents: 1200, taxCents: 540, totalCents: 11334 })
})

test('reject invalid dates, relationships, empty lines, quantities and monetary values', () => {
  const { repo } = setup()
  for (const fields of [{ name: ' ' }, { validUntil: '2026-02-30' }, { validUntil: '2026-09-19' }, { customerId: 'missing' }, { opportunityId: 'op2' }, { lines: [] }]) {
    assert.throws(() => repo.create(content({}, fields), sales))
  }
  for (const line of [{ productId: 'missing' }, { quantity: 0 }, { quantity: 1.5 }, { unitPrice: -1 }, { unitPrice: NaN }, { unitPrice: Infinity }, { unitPrice: 1.001 }, { taxPercent: 101 }, { discountPercent: 101 }, { unitPrice: Number.MAX_SAFE_INTEGER }]) {
    assert.throws(() => repo.create(content(line), sales))
  }
  const line = content().lines[0]
  assert.throws(() => repo.create(content({}, { lines: [line, line] }), sales), /識別碼/)
  assert.equal(repo.getSnapshot().length, 0)
})

test('only sales creates and submits; only managers approve; pending and approved versions are locked', () => {
  const { repo } = setup()
  assert.throws(() => repo.create(content(), manager), /業務/)
  const q = repo.create(content({ discountPercent: 11 }), sales), v = latest(q)
  assert.throws(() => repo.send(q.id, v.id, sales), /審批/)
  repo.requestApproval(q.id, v.id, sales)
  assert.throws(() => repo.review(q.id, v.id, true, '', sales), /主管/)
  assert.throws(() => repo.update(q.id, v.id, 1, content(), sales), /鎖定/)
  assert.throws(() => repo.newVersion(q.id, v.id, sales), /等待/)
  repo.review(q.id, v.id, true, '批准', manager)
  assert.throws(() => repo.update(q.id, v.id, 2, content(), sales), /鎖定/)
  assert.equal(latest(repo.send(q.id, v.id, sales)).status, 'Sent')
})

test('manager rejection needs a reason and can be revised and resubmitted', () => {
  const { repo } = setup()
  const q = repo.create(content({ discountPercent: 11 }), sales), v = latest(q)
  repo.requestApproval(q.id, v.id, sales)
  assert.throws(() => repo.review(q.id, v.id, false, '  ', manager), /原因/)
  const rejected = latest(repo.review(q.id, v.id, false, '折扣過高', manager))
  assert.equal(rejected.approvalReason, '折扣過高')
  const revised = latest(repo.update(q.id, v.id, rejected.revision, content({ discountPercent: 10.5 }), sales))
  assert.equal(revised.approval, 'Required')
  assert.equal(latest(repo.requestApproval(q.id, v.id, sales)).approval, 'Pending')
})

test('approved revisions must get approval again even after reducing below the threshold', () => {
  const { repo } = setup()
  const q = repo.create(content({ discountPercent: 11 }), sales), v = latest(q)
  repo.requestApproval(q.id, v.id, sales)
  const approved = latest(repo.review(q.id, v.id, true, '', manager))
  const next = latest(repo.newVersion(q.id, v.id, sales))
  const edited = latest(repo.update(q.id, next.id, next.revision, content(), sales))
  assert.equal(edited.version, 2)
  assert.equal(edited.approval, 'Required')
  assert.throws(() => repo.send(q.id, next.id, sales), /審批/)
  assert.deepEqual(repo.getSnapshot()[0].versions[0], approved)
  repo.requestApproval(q.id, next.id, sales)
  repo.review(q.id, next.id, true, '', manager)
  assert.equal(latest(repo.send(q.id, next.id, sales)).status, 'Sent')
})

test('sent versions cannot be edited and superseded versions cannot be accepted', () => {
  const { repo } = setup()
  const q = repo.create(content(), sales), v = latest(q)
  repo.send(q.id, v.id, sales)
  assert.throws(() => repo.update(q.id, v.id, 1, content(), sales), /鎖定/)
  const q2 = repo.newVersion(q.id, v.id, sales)
  assert.equal(q2.versions[0].status, 'Sent')
  assert.equal(latest(q2).version, 2)
  assert.throws(() => repo.decide(q.id, v.id, true, '', customer), /歷史版本/)
  assert.equal(latest(repo.newVersion(q.id, latest(q2).id, sales)).version, 3)
})

test('customer decisions require Sent, the correct actor, and a rejection reason', () => {
  const { repo } = setup()
  const q = repo.create(content(), sales), v = latest(q)
  assert.throws(() => repo.decide(q.id, v.id, true, '', customer), /已送出/)
  repo.send(q.id, v.id, sales)
  assert.throws(() => repo.decide(q.id, v.id, true, '', manager), /客戶/)
  assert.throws(() => repo.decide(q.id, v.id, false, ' ', customer), /原因/)
  const rejected = latest(repo.decide(q.id, v.id, false, '預算不足', customer))
  assert.equal(rejected.status, 'Rejected')
  assert.equal(rejected.decisionReason, '預算不足')
  assert.equal(rejected.decisionBy, customer.name)
  assert.equal(rejected.decisionAt, '2026-09-20T02:00:00.000Z')
  assert.throws(() => repo.decide(q.id, v.id, true, '', customer))
})

test('Taipei end of day expiry blocks acceptance immediately and emits just one audit event', () => {
  const { repo, now } = setup()
  const q = repo.create(content(), sales), v = latest(q)
  repo.send(q.id, v.id, sales)
  now('2026-09-20T23:59:59+08:00')
  const before = repo.getSnapshot()
  repo.expire()
  assert.equal(repo.getSnapshot(), before)
  assert.equal(quoteToday(new Date('2026-09-20T16:00:00Z')), '2026-09-21')
  now('2026-09-21T00:00:00+08:00')
  assert.throws(() => repo.decide(q.id, v.id, true, '', customer), /有效期限/)
  const expired = repo.getSnapshot()
  assert.equal(latest(expired[0]).status, 'Expired')
  repo.expire()
  assert.equal(repo.getSnapshot(), expired)
  assert.equal(expired[0].audit.filter(event => event.action === '報價過期').length, 1)
})

test('a pending quote that expires can start a new version and approval round', () => {
  const { repo, now } = setup()
  const q = repo.create(content({ discountPercent: 11 }), sales), v = latest(q)
  repo.requestApproval(q.id, v.id, sales)
  now('2026-09-21T00:00:00+08:00')
  assert.throws(() => repo.review(q.id, v.id, true, '', manager), /待審批/)
  const next = latest(repo.newVersion(q.id, v.id, sales))
  assert.equal(next.status, 'Draft')
  assert.equal(next.approval, 'Required')
  assert.equal(next.validUntil, '2026-09-21')
})

test('acceptance at the last second is valid and remains Accepted after the deadline', () => {
  const { repo, now } = setup()
  const q = repo.create(content(), sales), v = latest(q)
  repo.send(q.id, v.id, sales)
  now('2026-09-20T23:59:59+08:00')
  repo.decide(q.id, v.id, true, '', customer)
  now('2026-09-21T00:00:00+08:00')
  repo.expire()
  assert.equal(latest(repo.getSnapshot()[0]).status, 'Accepted')
})

test('expired drafts and approved quotes cannot be changed or sent', () => {
  const { repo, now } = setup()
  const draft = repo.create(content(), sales), d = latest(draft)
  const approved = repo.create(content({ discountPercent: 11 }), sales), a = latest(approved)
  repo.requestApproval(approved.id, a.id, sales)
  repo.review(approved.id, a.id, true, '', manager)
  now('2026-09-21T00:00:00+08:00')
  assert.throws(() => repo.update(draft.id, d.id, 0, content({}, { validUntil: '2026-09-22' }), sales), /鎖定/)
  assert.throws(() => repo.send(approved.id, a.id, sales))
  assert.ok(repo.getSnapshot().every(q => latest(q).status === 'Expired'))
})

test('price and product snapshots survive product changes, draft saves, and version copies', () => {
  const { repo, products } = setup()
  const q = repo.create(content(), sales), v = latest(q)
  Object.assign(products[0], { name: '新名稱', sku: 'NEW-SKU', price: 9000, status: '停用' })
  const edited = latest(repo.update(q.id, v.id, v.revision, { ...v, notes: '補充備註' }, sales))
  assert.equal(edited.lines[0].catalogPrice, 1000)
  assert.equal(edited.lines[0].unitPrice, 1000)
  assert.equal(edited.lines[0].productName, '商品')
  assert.equal(edited.lines[0].sku, 'SKU-1')
  const copied = latest(repo.newVersion(q.id, v.id, sales))
  assert.deepEqual(copied.lines, edited.lines)
  assert.throws(() => repo.create(content(), sales), /啟用/)
})

test('only Accepted converts; order retains totals, terms and snapshots, and conversion is idempotent', () => {
  const { repo, orders, now, products } = setup()
  const input = content({ unitPrice: 19.99, quantity: 3, discountPercent: 10 })
  const q = repo.create(input, sales), v = latest(q)
  assert.throws(() => repo.convertToOrder(q.id, v.id, sales), /已接受/)
  repo.send(q.id, v.id, sales)
  repo.decide(q.id, v.id, true, '同意', customer)
  now('2026-10-01T12:00:00+08:00')
  products[0].price = 9000
  const orderId = repo.convertToOrder(q.id, v.id, sales)
  assert.equal(repo.convertToOrder(q.id, v.id, sales), orderId)
  assert.equal(orders.length, 1)
  assert.equal(orders[0].quoteSource.totals.totalCents, 5667)
  assert.equal(orders[0].quoteSource.paymentTerms, input.paymentTerms)
  assert.equal(orders[0].quoteSource.deliveryTerms, input.deliveryTerms)
  assert.equal(orders[0].quoteSource.warranty, input.warranty)
  assert.equal(orders[0].quoteSource.notes, input.notes)
  assert.equal(orders[0].quoteSource.lines[0].catalogPrice, 1000)
  assert.equal(latest(repo.getSnapshot()[0]).status, 'Accepted')
  assert.throws(() => repo.newVersion(q.id, v.id, sales), /已接受/)
  assert.equal(repo.getSnapshot()[0].audit.filter(event => event.action === '轉換訂單').length, 1)
})

test('real order repository blocks editing an order converted from a quote', () => {
  const { repo } = setup(orderRepository)
  const q = repo.create(content(), sales), v = latest(q)
  repo.send(q.id, v.id, sales)
  repo.decide(q.id, v.id, true, '', customer)
  const id = repo.convertToOrder(q.id, v.id, sales)
  const order = orderRepository.getSnapshot().find(item => item.id === id)
  assert.throws(() => orderRepository.save({ ...order, name: '改寫快照' }), /快照/)
})

test('reject stale revisions and protect lifecycle and immutable audit/snapshots', () => {
  const { repo } = setup()
  const q = repo.create(content(), sales), v = latest(q)
  const modified = repo.update(q.id, v.id, 0, { ...content(), status: 'Accepted', approval: 'Approved', version: 99, requiresReapproval: false }, sales)
  assert.equal(latest(modified).status, 'Draft')
  assert.equal(latest(modified).version, 1)
  assert.equal(latest(modified).approval, 'NotRequired')
  assert.throws(() => repo.update(q.id, v.id, 0, content(), sales), /重新載入/)
  assert.throws(() => { latest(modified).lines[0].unitPrice = 0 }, TypeError)
  assert.throws(() => { modified.audit[0].actorName = '其他人' }, TypeError)
  assert.throws(() => repo.getSnapshot().push(q), TypeError)
  assert.deepEqual(modified.audit.map(event => event.action), ['建立報價', '修改報價'])
  assert.ok(modified.audit.every(event => event.actorId === sales.id && event.actorName === sales.name && event.at))
})

test('subscriptions notify only when state changes and can unsubscribe', () => {
  const { repo } = setup()
  let calls = 0
  const unsubscribe = repo.subscribe(() => { calls++ })
  repo.expire()
  assert.equal(calls, 0)
  repo.create(content(), sales)
  assert.equal(calls, 1)
  unsubscribe()
  repo.create(content(), sales)
  assert.equal(calls, 1)
})

test('local quote editing and versions work without recording a fictitious actor', () => {
  const { repo } = setup()
  const q = repo.create(content(), null), v = latest(q)
  repo.update(q.id, v.id, v.revision, content({}, { notes: '更新備註' }), null)
  const revised = repo.newVersion(q.id, v.id, null)
  assert.equal(latest(revised).version, 2)
  assert.equal(latest(revised).notes, '更新備註')
  assert.ok(revised.versions.every(version => version.createdBy === undefined))
  assert.ok(revised.audit.every(event => event.actorId === undefined && event.actorName === undefined))
  assert.deepEqual(revised.audit.map(event => event.action), ['建立報價', '修改報價', '建立新版本'])
  assert.equal(latest(repo.send(q.id, latest(revised).id, null)).status, 'Sent')
})

test('absence of an actor never grants manager approval or customer decision permissions', () => {
  const { repo } = setup()
  const q = repo.create(content({ discountPercent: 11 }), null), v = latest(q)
  repo.requestApproval(q.id, v.id, null)
  assert.throws(() => repo.review(q.id, v.id, true, '', null), /主管/)
  assert.throws(() => repo.send(q.id, v.id, null), /審批/)
  repo.review(q.id, v.id, true, '', manager)
  repo.send(q.id, v.id, null)
  assert.throws(() => repo.decide(q.id, v.id, true, '', null), /客戶/)
  assert.equal(latest(repo.getSnapshot()[0]).status, 'Sent')
})

test('batch deletion removes whole quotes and versions, enforces actor permissions, and notifies once', () => {
  const { repo } = setup()
  const first = repo.create(content(), null)
  repo.newVersion(first.id, latest(first).id, null)
  const second = repo.create(content(), null)
  const kept = repo.create(content(), null)
  let calls = 0
  repo.subscribe(() => calls++)
  assert.throws(() => repo.removeMany([first.id], customer), /業務/)
  assert.equal(repo.getSnapshot().length, 3)
  repo.removeMany([first.id, second.id, first.id, 'missing'], null)
  assert.deepEqual(repo.getSnapshot(), [kept])
  assert.equal(calls, 1)
  assert.throws(() => repo.newVersion(first.id, latest(first).id, null), /找不到/)
  const after = repo.getSnapshot()
  repo.removeMany([first.id], null)
  repo.removeMany([], null)
  assert.equal(repo.getSnapshot(), after)
  assert.equal(calls, 1)
  repo.removeMany([kept.id], null)
  assert.equal(repo.getSnapshot().length, 0)
  assert.equal(calls, 2)
})
