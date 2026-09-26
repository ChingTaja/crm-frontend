export const permissionEntities = [
  { id: 'customers', name: '客戶' },
  { id: 'opportunities', name: '商機' },
  { id: 'orders', name: '訂單' },
] as const
export const permissionActions = [
  { id: 'create', name: '新增' }, { id: 'read', name: '查看' },
  { id: 'update', name: '修改' }, { id: 'delete', name: '刪除' },
] as const
export const permissions = permissionEntities.flatMap(entity => permissionActions.map(action => ({
  id: `${entity.id}:${action.id}`, entity: entity.id, action: action.id,
})))
export interface Account { id: string; code: string; email: string }
export interface Role { id: string; name: string }
interface AccessState {
  users: Account[]
  roles: Role[]
  user_roles: { user_id: string; role_id: string }[]
  role_permissions: { role_id: string; permission_id: string }[]
}
let state: AccessState = {
  users: [{ id: 'demo-user', code: 'demo', email: 'demo@example.com' }],
  roles: [{ id: 'sales', name: '業務人員' }],
  user_roles: [{ user_id: 'demo-user', role_id: 'sales' }],
  role_permissions: permissions.filter(p => p.action === 'read').map(p => ({ role_id: 'sales', permission_id: p.id })),
}
const listeners = new Set<() => void>()
function commit(next: AccessState) { state = next; listeners.forEach(listener => listener()) }
export const accessStore = {
  getSnapshot: () => state,
  subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } },
  saveUser(input: Account & { password: string }, roleIds: string[]) {
    const code = input.code.trim()
    const email = input.email.trim()
    if (!code) throw new Error('請填寫帳號。')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('請填寫有效的 Email。')
    if (!input.id && !input.password.trim()) throw new Error('新增帳號請填寫密碼。')
    if (input.id && !state.users.some(u => u.id === input.id)) throw new Error('找不到此帳號。')
    if (state.users.some(u => u.id !== input.id && u.code.toLowerCase() === code.toLowerCase())) throw new Error('此帳號名稱已存在。')
    if (roleIds.some(id => !state.roles.some(r => r.id === id))) throw new Error('角色已不存在，請重新選擇。')
    // Preview only: passwords are never retained in the client store.
    const user = { id: input.id || crypto.randomUUID(), code, email }
    commit({ ...state, users: input.id ? state.users.map(u => u.id === user.id ? user : u) : [...state.users, user],
      user_roles: [...state.user_roles.filter(link => link.user_id !== user.id), ...[...new Set(roleIds)].map(role_id => ({ user_id: user.id, role_id }))] })
  },
  saveRole(input: Role, permissionIds: string[]) {
    const name = input.name.trim()
    if (!name) throw new Error('請填寫角色名稱。')
    if (input.id && !state.roles.some(r => r.id === input.id)) throw new Error('找不到此角色。')
    if (state.roles.some(r => r.id !== input.id && r.name.toLowerCase() === name.toLowerCase())) throw new Error('此角色名稱已存在。')
    if (permissionIds.some(id => !permissions.some(p => p.id === id))) throw new Error('包含無效的權限。')
    const role = { id: input.id || crypto.randomUUID(), name }
    commit({ ...state, roles: input.id ? state.roles.map(r => r.id === role.id ? role : r) : [...state.roles, role],
      role_permissions: [...state.role_permissions.filter(link => link.role_id !== role.id), ...[...new Set(permissionIds)].map(permission_id => ({ role_id: role.id, permission_id }))] })
  },
  deleteRole(id: string) {
    if (state.user_roles.some(link => link.role_id === id)) throw new Error('此角色仍有帳號使用，請先修改帳號的角色。')
    commit({ ...state, roles: state.roles.filter(r => r.id !== id), role_permissions: state.role_permissions.filter(link => link.role_id !== id) })
  },
}
