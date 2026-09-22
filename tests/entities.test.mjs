import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadDomainModules } from './helpers/load-domain-modules.mjs'

function setup() {
  const [customer, contact, lead, opportunity, product, order, qualification] = loadDomainModules([
    'features/customer/models/customer-model',
    'features/contact/models/contact-model',
    'features/lead/models/lead-model',
    'features/opportunity/models/opportunity-model',
    'features/product/models/product-model',
    'features/order/models/order-model',
    'features/lead/models/lead-qualification',
  ])
  return { ...customer, ...contact, ...lead, ...opportunity, ...product, ...order, ...qualification }
}

test('split entity fixtures retain counts, IDs and cross-entity relationships', () => {
  const data = setup()
  const customers = data.customerRepository.getSnapshot()
  const contacts = data.contactRepository.getSnapshot()
  const leads = data.leadRepository.getSnapshot()
  const opportunities = data.opportunityRepository.getSnapshot()
  const products = data.productRepository.getSnapshot()
  const orders = data.orderRepository.getSnapshot()
  assert.equal(customers.length, 150)
  assert.equal(contacts.length, 150)
  for (const records of [leads, opportunities, products, orders]) assert.equal(records.length, 15)
  assert.equal(customers[149].id, 'c150')
  assert.equal(contacts[149].id, 'p150')
  assert.ok(contacts.every(c => customers.some(customer => customer.id === c.customerId)))
  assert.ok(opportunities.every(o => customers.some(c => c.id === o.customerId) && leads.some(l => l.id === o.leadId)))
  assert.ok(orders.every(o => customers.some(c => c.id === o.customerId) && opportunities.some(p => p.id === o.opportunityId)
    && o.items.every(line => products.some(p => p.id === line.productId))))
})

test('qualifying a Lead creates Customer and Contact in their own repositories without duplicates', () => {
  const data = setup()
  const result = data.qualifyLead('lead-1', { decision: 'approved', createOpportunity: false })
  const { customerId, contactId, opportunityId } = result.qualification
  assert.equal(result.status, '已合格')
  assert.equal(opportunityId, undefined)
  assert.equal(data.customerRepository.getSnapshot().find(c => c.id === customerId).name, result.company)
  const contact = data.contactRepository.getSnapshot().find(c => c.id === contactId)
  assert.equal(contact.customerId, customerId)
  assert.equal(contact.email, result.email)
  data.qualifyLead('lead-1', { decision: 'approved', createOpportunity: false })
  assert.equal(data.customerRepository.getSnapshot().length, 151)
  assert.equal(data.contactRepository.getSnapshot().length, 151)
  assert.equal(data.opportunityRepository.getSnapshot().length, 15)
})

test('qualifying with Opportunity connects all records and can upgrade an existing conversion', () => {
  const data = setup()
  const original = data.qualifyLead('lead-2', { decision: 'approved', createOpportunity: false })
  const converted = data.qualifyLead('lead-2', { decision: 'approved', createOpportunity: true })
  assert.equal(converted.qualification.customerId, original.qualification.customerId)
  assert.equal(converted.qualification.contactId, original.qualification.contactId)
  const opportunity = data.opportunityRepository.getSnapshot().find(o => o.id === converted.qualification.opportunityId)
  assert.equal(opportunity.leadId, converted.id)
  assert.equal(opportunity.customerId, converted.qualification.customerId)
  data.qualifyLead('lead-2', { decision: 'approved', createOpportunity: true })
  assert.equal(data.opportunityRepository.getSnapshot().length, 16)
  assert.equal(data.customerRepository.getSnapshot().length, 151)
  assert.throws(() => data.qualifyLead('lead-2', { decision: 'rejected', reason: '預算不足', note: '' }), /已轉換/)
})

test('disqualification requires a reason and changes only the Lead repository', () => {
  const data = setup()
  assert.throws(() => data.qualifyLead('lead-3', { decision: 'rejected', reason: '', note: '' }), /原因/)
  assert.throws(() => data.qualifyLead('lead-3', { decision: 'rejected', reason: '其他', note: ' ' }), /原因/)
  const result = data.qualifyLead('lead-3', { decision: 'rejected', reason: '預算不足', note: '下年度再聯繫' })
  assert.equal(result.status, '不合格')
  assert.equal(result.qualification.reason, '預算不足')
  assert.equal(data.customerRepository.getSnapshot().length, 150)
  assert.equal(data.contactRepository.getSnapshot().length, 150)
  assert.equal(data.opportunityRepository.getSnapshot().length, 15)
})

test('entity stores notify independently and customer/contact edits retain their relationships', () => {
  const data = setup()
  let customerCalls = 0, contactCalls = 0
  data.customerRepository.subscribe(() => customerCalls++)
  data.contactRepository.subscribe(() => contactCalls++)
  const customer = data.customerRepository.create({ name: '新客戶', industry: '', owner: '', createdAt: '2026-09-21', address: '' })
  assert.equal(customerCalls, 1)
  assert.equal(contactCalls, 0)
  const contact = data.contactRepository.create({ customerId: customer.id, name: '聯絡人', title: '', email: '', phone: '', createdAt: '2026-09-21' })
  data.customerRepository.update({ ...customer, name: '更新客戶' })
  data.contactRepository.update({ ...contact, email: 'contact@example.com' })
  assert.equal(data.contactRepository.getSnapshot()[0].customerId, customer.id)
  assert.equal(data.contactRepository.getSnapshot()[0].email, 'contact@example.com')
  assert.equal(data.customerRepository.getSnapshot()[0].name, '更新客戶')
  assert.equal(customerCalls, 2)
  assert.equal(contactCalls, 2)
})

test('all six entity repositories delete selected records in one update without touching other rows', () => {
  const data = setup()
  for (const name of ['customer', 'contact', 'lead', 'opportunity', 'product', 'order']) {
    const repository = data[`${name}Repository`]
    const before = repository.getSnapshot()
    const ids = [before[0].id, before[2].id]
    let calls = 0
    const unsubscribe = repository.subscribe(() => calls++)
    repository.removeMany([...ids, ids[0], 'missing'])
    assert.equal(repository.getSnapshot().length, before.length - 2, name)
    assert.deepEqual(repository.getSnapshot(), before.filter(record => !ids.includes(record.id)), name)
    assert.equal(calls, 1, name)
    const after = repository.getSnapshot()
    repository.removeMany(ids)
    repository.removeMany([])
    assert.equal(repository.getSnapshot(), after, name)
    assert.equal(calls, 1, name)
    unsubscribe()
  }
})

test('deletion does not cascade into related entity repositories', () => {
  const data = setup()
  const contacts = data.contactRepository.getSnapshot()
  const orders = data.orderRepository.getSnapshot()
  const opportunities = data.opportunityRepository.getSnapshot()
  data.customerRepository.removeMany(['c1'])
  data.productRepository.removeMany(['product-1'])
  assert.equal(data.contactRepository.getSnapshot(), contacts)
  assert.equal(data.orderRepository.getSnapshot(), orders)
  assert.equal(data.opportunityRepository.getSnapshot(), opportunities)
})
