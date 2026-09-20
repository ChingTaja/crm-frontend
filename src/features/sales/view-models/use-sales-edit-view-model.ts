import { useState, type FormEvent } from 'react'
import { customerRepository } from '@/features/customers/models/customer-model'
import { leadRepository, opportunityRepository, productRepository, orderRepository, type Lead, type Opportunity, type Product, type Order, type SalesEntity } from '../models/sales-model'

type SalesDraft = Omit<Lead, 'status'> & Opportunity & Omit<Product, 'status'> & Omit<Order, 'status'> & { status: string }
export function useSalesEditViewModel(entity: SalesEntity, record?: Lead | Opportunity | Product | Order) {
  const [initial] = useState<SalesDraft>(() => ({ id: '', name: '', company: '', email: '', phone: '', source: '', owner: '', customerId: '', leadId: '', amount: 0, expectedCloseDate: '', stage: '需求確認', sku: '', price: 0, opportunityId: '', items: [], status: entity === 'products' ? '啟用' : entity === 'orders' ? '草稿' : '待聯繫', ...record }))
  const [draft, setDraft] = useState(() => structuredClone(initial))
  const [error, setError] = useState('')
  const back = () => { window.location.hash = `/${entity}` }
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.name.trim()) { setError('請輸入名稱。'); return }
    if ((entity === 'opportunities' || entity === 'orders') && !customerRepository.getSnapshot().some(item => item.id === draft.customerId)) { setError('請選擇所屬客戶。'); return }
    const { id, customerId } = draft
    const name = draft.name.trim()
    if (entity === 'leads') {
      const { company, email, phone, source, owner } = draft
      const current = leadRepository.getSnapshot().find(item => item.id === id)
      leadRepository.save({ ...current, id, name, company, email: email.trim(), phone, source, owner, status: current?.qualification ? current.status : draft.status as Lead['status'] })
    } else if (entity === 'opportunities') {
      if (!Number.isFinite(draft.amount) || draft.amount < 0) { setError('金額必須為非負數。'); return }
      const { leadId, amount, expectedCloseDate, owner, stage } = draft
      opportunityRepository.save({ id, name, customerId, leadId, amount, expectedCloseDate, owner, stage })
    } else if (entity === 'products') {
      if (!draft.sku.trim()) { setError('請輸入產品編號。'); return }
      if (productRepository.getSnapshot().some(item => item.id !== id && item.sku.toLowerCase() === draft.sku.trim().toLowerCase())) { setError('產品編號已存在。'); return }
      if (!Number.isFinite(draft.price) || draft.price < 0) { setError('單價必須為非負數。'); return }
      productRepository.save({ id, name, sku: draft.sku.trim(), price: draft.price, status: draft.status as Product['status'] })
    } else {
      if (!draft.items.length || draft.items.some(line => !productRepository.getSnapshot().some(p => p.id === line.productId) || !Number.isInteger(line.quantity) || line.quantity < 1 || !Number.isFinite(line.unitPrice) || line.unitPrice < 0)) { setError('請加入產品，數量須為正整數，單價須為非負數。'); return }
      if (draft.opportunityId && !opportunityRepository.getSnapshot().some(item => item.id === draft.opportunityId && item.customerId === customerId)) { setError('來源商機必須屬於所選客戶。'); return }
      orderRepository.save({ id, name, customerId, opportunityId: draft.opportunityId, items: draft.items.map(line => ({ ...line })), status: draft.status as Order['status'] })
    }
    back()
  }
  return { draft, error, back, save, isDirty: JSON.stringify(draft) !== JSON.stringify(initial), reset: () => { setDraft(structuredClone(initial)); setError('') },
    update: <K extends keyof SalesDraft>(field: K, value: SalesDraft[K]) => { setDraft(current => ({ ...current, [field]: value, ...(field === 'customerId' ? { opportunityId: '' } : {}) })); setError('') } }
}
