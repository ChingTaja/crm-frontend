import { createRepository } from '../../../lib/in-memory-repository'
export const productStatuses = ['啟用', '停用'] as const
export interface Product {
  id: string
  name: string
  sku: string
  price: number
  status: typeof productStatuses[number]
}
export const productRepository = createRepository<Product>(Array.from({ length: 15 }, (_, i) => ({ id: `product-${i + 1}`, name: `服務方案 ${i + 1}`, sku: `SKU-${String(i + 1).padStart(3, '0')}`, price: (i + 1) * 1000, status: '啟用' })))
