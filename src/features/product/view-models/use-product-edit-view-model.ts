import { useEntityForm } from '@/hooks/use-entity-form'
import { productRepository, type Product } from '../models/product-model'

export function useProductEditViewModel(record?: Product) {
  const initial: Product = { id: '', name: '', sku: '', price: 0, status: '啟用', ...record }
  return useEntityForm('products', initial, draft => {
    if (!draft.sku.trim()) throw new Error('請輸入產品編號。')
    if (productRepository.getSnapshot().some(item => item.id !== draft.id && item.sku.toLowerCase() === draft.sku.trim().toLowerCase())) throw new Error('產品編號已存在。')
    if (!Number.isFinite(draft.price) || draft.price < 0) throw new Error('單價必須為非負數。')
    productRepository.save({ ...draft, sku: draft.sku.trim() })
  })
}
