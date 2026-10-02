import type { CreateProductRequest, ProductResponse } from '../../../api/Api';
import { useEntityForm } from '@/hooks/use-entity-form';
import { useApi } from '@/hooks/use-api';
import { productApi } from '../models/product-service';
import { cacheProduct } from '../models/product-model';

export function useProductEditViewModel(record?: ProductResponse) {
  const request = useApi(productApi.save);
  const initial: CreateProductRequest = {
    name: record?.name ?? '', sku: record?.sku ?? '', price: record?.price ?? 0, status: record?.status ?? '啟用',
  };
  return useEntityForm('products', initial, async draft => {
    if (!draft.sku.trim()) throw new Error('請輸入產品編號。');
    if (!Number.isFinite(draft.price) || draft.price < 0) throw new Error('單價必須為非負數。');
    cacheProduct(await request.execute({ ...draft, sku: draft.sku.trim() }, record?.id));
  });
}
