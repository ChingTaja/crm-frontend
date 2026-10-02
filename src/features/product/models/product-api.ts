import { unwrapResponse, deleteRecords } from '../../../lib/api-operations';
import { collectPages } from '../../../lib/api-pagination';
import type { Api, ProductResponse, CreateProductRequest } from '../../../api/Api';

function product(record: ProductResponse): Required<ProductResponse> {
  if (!record?.id || typeof record.name !== 'string' || typeof record.sku !== 'string' ||
    typeof record.price !== 'number' || !Number.isFinite(record.price) || record.price < 0 ||
    !['啟用', '停用'].includes(record.status ?? '')) throw new Error('產品 API 回傳格式不正確。');
  return { id: record.id, name: record.name, sku: record.sku, price: record.price, status: record.status! };
}
export function createProductApi(client: Api<unknown>['api']) {
  const remove = async (signal: AbortSignal, id: string) => {
    await client.deleteProducts(encodeURIComponent(id), { signal });
  };
  const list = async (
    signal: AbortSignal,
    query: Parameters<Api<unknown>['api']['findAllProducts']>[0] = { page: 0, size: 20 }
  ) => {
    const data = await unwrapResponse(client.findAllProducts(query, { signal, format: 'json' }));
    if (
      !data ||
      !Array.isArray(data.content) ||
      !Number.isInteger(data.totalPages) ||
      !Number.isInteger(data.totalElements)
    ) {
      throw new Error('Product 列表回傳格式不正確。');
    }
    return { ...data, content: data.content.map(product) };
  };
  return {
    list,
    listAll: (signal: AbortSignal) => collectPages(signal, list),
    async get(signal: AbortSignal, id: string) {
      return product(
        await unwrapResponse(client.findByIdProduct(encodeURIComponent(id), { signal, format: 'json' }))
      );
    },
    async save(signal: AbortSignal, fields: CreateProductRequest, id?: string) {
      const params = { signal, format: 'json' as const };
      return product(
        await unwrapResponse(
          id
            ? client.updateProducts(encodeURIComponent(id), fields, params)
            : client.createProducts(fields, params)
        )
      );
    },
    remove,
    removeMany: (signal: AbortSignal, ids: string[]) => deleteRecords(signal, ids, remove),
  };
}
