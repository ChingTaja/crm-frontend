import type { Api, CreateRoleRequest, UpdateRoleRequest } from '../../../api/Api';
import { unwrapResponse } from '../../../lib/api-operations';
export function createRoleApi(client: Api<unknown>['api']) {
  return {
    list: (signal: AbortSignal, query: Parameters<typeof client.findAllRoles>[0]) => unwrapResponse(client.findAllRoles(query, { signal, format: 'json' })),
    get: (signal: AbortSignal, id: string) => unwrapResponse(client.findByIdRole(encodeURIComponent(id), { signal, format: 'json' })),
    create: (signal: AbortSignal, body: CreateRoleRequest) => unwrapResponse(client.createRoles(body, { signal, format: 'json' })),
    update: (signal: AbortSignal, id: string, body: UpdateRoleRequest) => unwrapResponse(client.updateRoles(encodeURIComponent(id), body, { signal, format: 'json' })),
    remove: async (signal: AbortSignal, id: string) => { await client.deleteRoles(encodeURIComponent(id), { signal }); },
    options: (signal: AbortSignal, keyword = '') => unwrapResponse(client.roleOptions({ keyword }, { signal, format: 'json' })),
    permissions: (signal: AbortSignal) => unwrapResponse(client.findAllPermissions({ signal, format: 'json' })),
  };
}
