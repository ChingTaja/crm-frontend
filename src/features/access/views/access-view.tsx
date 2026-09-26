import { AppLink } from '@/components/ui/app-link';
import { useState, useSyncExternalStore, type FormEvent } from 'react'
import { Plus, ShieldCheck, Users } from 'lucide-react'
import { EntityWorkspace } from '@/components/layout/entity-workspace'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { accessStore, permissionActions, permissionEntities, permissions, type Account, type Role } from '../models/access-model'

const cell = 'border-b px-4 py-3 text-left'
function toggle(values: string[], id: string) { return values.includes(id) ? values.filter(value => value !== id) : [...values, id] }

export function AccessView({ section }: { section: 'users' | 'roles' }) {
  const state = useSyncExternalStore(accessStore.subscribe, accessStore.getSnapshot)
  const [editing, setEditing] = useState<Account | Role | null>(null)
  const [deleting, setDeleting] = useState<Role | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const users = section === 'users'
  return <EntityWorkspace sidebar={<aside className="border-r bg-[#f8f9f8] p-4">
    <p className="mb-3 px-3 text-xs text-muted-foreground">權限管理</p>
    <nav className="flex gap-1 md:grid">{[{ id: 'users', label: '帳號管理', icon: Users }, { id: 'roles', label: '角色權限', icon: ShieldCheck }].map(({ id, label, icon: Icon }) =>
      <AppLink key={id} href={`/${id}`} aria-current={section === id ? 'page' : undefined} className="flex items-center gap-2 rounded-lg p-3 text-muted-foreground hover:bg-muted aria-[current=page]:bg-[#e9eee7] aria-[current=page]:text-[#284c36]"><Icon size={18} />{label}</AppLink>)}</nav>
  </aside>}>
    <div className="flex flex-wrap items-center justify-between gap-3 py-6">
      <div><p className="mb-2 text-xs text-muted-foreground">權限管理 / {users ? 'Users' : 'Roles'}</p><h1 className="text-2xl font-semibold">{users ? '帳號管理' : '角色權限'}</h1></div>
      <Button onClick={() => { setNotice(''); setEditing(users ? { id: '', code: '', email: '' } : { id: '', name: '' }) }}><Plus size={16} />新增{users ? '帳號' : '角色'}</Button>
    </div>
    <p className="mb-5 rounded-lg bg-[#f5f7f3] p-3 text-sm text-muted-foreground">前端預覽：資料於重新整理後重設，密碼不會儲存；權限尚未套用至實際操作。</p>
    {notice && <p role="status" className="mb-4 text-[#284c36]">{notice}</p>}
    <div className="overflow-x-auto rounded-lg border"><table className="w-full whitespace-nowrap text-sm">
      <thead className="bg-[#f8f9f8]"><tr>{(users ? ['帳號', 'Email', '角色', '操作'] : ['角色名稱', '使用人數', '權限數', '操作']).map(label => <th key={label} className={cell}>{label}</th>)}</tr></thead>
      <tbody>{users ? state.users.map(user => <tr key={user.id}>
        <td className={cell}>{user.code}</td><td className={cell}>{user.email}</td>
        <td className={cell}>{state.user_roles.filter(link => link.user_id === user.id).map(link => state.roles.find(role => role.id === link.role_id)?.name).join('、') || '未指派'}</td>
        <td className={cell}><Button variant="outline" size="sm" onClick={() => setEditing(user)} aria-label={`修改帳號 ${user.code}`}>修改</Button></td>
      </tr>) : state.roles.map(role => <tr key={role.id}>
        <td className={cell}>{role.name}</td><td className={cell}>{state.user_roles.filter(link => link.role_id === role.id).length}</td>
        <td className={cell}>{state.role_permissions.filter(link => link.role_id === role.id).length} / {permissions.length}</td>
        <td className={cell}><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setEditing(role)} aria-label={`設定角色 ${role.name}`}>設定</Button><Button variant="ghost" size="sm" onClick={() => { setError(''); setDeleting(role) }} aria-label={`刪除角色 ${role.name}`}>刪除</Button></div></td>
      </tr>)}{(users ? state.users : state.roles).length === 0 && <tr><td colSpan={4} className="p-10 text-center text-muted-foreground">尚無{users ? '帳號' : '角色'}，點選上方按鈕新增。</td></tr>}</tbody>
    </table></div>
    <Dialog open={editing !== null} onOpenChange={open => { if (!open) setEditing(null) }}><DialogContent>
      {editing && <AccessEditor key={`${section}-${editing.id}`} record={editing} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); setNotice('已儲存預覽資料。') }} />}
    </DialogContent></Dialog>
    <Dialog open={deleting !== null} onOpenChange={open => { if (!open) setDeleting(null) }}><DialogContent>
      <DialogTitle className="text-lg font-semibold">刪除角色</DialogTitle><DialogDescription className="my-4">確定刪除「{deleting?.name}」及其權限設定？使用中的角色無法刪除。</DialogDescription>
      {error && <p role="alert" className="mb-4 text-red-600">{error}</p>}
      <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDeleting(null)}>取消</Button><Button onClick={() => { try { if (deleting) accessStore.deleteRole(deleting.id); setDeleting(null); setNotice('已刪除角色。') } catch (e) { setError((e as Error).message) } }}>確認刪除</Button></div>
    </DialogContent></Dialog>
  </EntityWorkspace>
}

function AccessEditor({ record, onCancel, onSaved }: { record: Account | Role; onCancel: () => void; onSaved: () => void }) {
  const state = useSyncExternalStore(accessStore.subscribe, accessStore.getSnapshot)
  const isUser = 'code' in record
  const [name, setName] = useState(isUser ? record.code : record.name)
  const [email, setEmail] = useState(isUser ? record.email : '')
  const [password, setPassword] = useState('')
  const [selected, setSelected] = useState<string[]>(isUser ? state.user_roles.filter(link => link.user_id === record.id).map(link => link.role_id) : state.role_permissions.filter(link => link.role_id === record.id).map(link => link.permission_id))
  const [error, setError] = useState('')
  function submit(event: FormEvent) {
    event.preventDefault()
    try {
      if (isUser) accessStore.saveUser({ id: record.id, code: name, email, password }, selected)
      else accessStore.saveRole({ id: record.id, name }, selected)
      setPassword(''); onSaved()
    } catch (e) { setError((e as Error).message) }
  }
  return <form onSubmit={submit} className="space-y-5">
    <div><DialogTitle className="text-lg font-semibold">{record.id ? '修改' : '新增'}{isUser ? '帳號' : '角色'}</DialogTitle><DialogDescription className="mt-1 text-sm text-muted-foreground">{isUser ? '設定帳號資料並指派角色，可選擇多個角色。' : '勾選此角色可操作的項目，未勾選即不授權。'}</DialogDescription></div>
    <label className="grid gap-2">{isUser ? '帳號' : '角色名稱'}<Input required maxLength={100} autoComplete={isUser ? 'off' : undefined} value={name} onChange={e => setName(e.target.value)} /></label>
    {isUser ? <>
      <label className="grid gap-2">Email<Input required type="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label className="grid gap-2">{record.id ? '新密碼（留空表示不變更）' : '密碼'}<Input required={!record.id} type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} /><span className="text-xs text-muted-foreground">預覽模式不會建立或變更登入密碼。</span></label>
      <fieldset className="space-y-2"><legend className="mb-2">指派角色</legend>{state.roles.length ? state.roles.map(role => <label key={role.id} className="flex items-center gap-2"><input className="size-4 accent-[#284c36]" type="checkbox" checked={selected.includes(role.id)} onChange={() => setSelected(toggle(selected, role.id))} />{role.name}</label>) : <p className="text-muted-foreground">尚無角色，可先儲存帳號，再至角色權限新增。</p>}</fieldset>
    </> : <div className="overflow-x-auto"><table className="w-full text-sm"><caption className="sr-only">Entity CRUD 權限設定</caption><thead><tr><th className="py-3 text-left">項目</th>{permissionActions.map(action => <th key={action.id} scope="col" className="p-2">{action.name}</th>)}</tr></thead><tbody>{permissionEntities.map(entity => <tr key={entity.id} className="border-t"><th scope="row" className="py-3 text-left font-normal">{entity.name}</th>{permissionActions.map(action => { const id = `${entity.id}:${action.id}`; return <td key={id} className="p-2 text-center"><input type="checkbox" className="size-4 accent-[#284c36]" aria-label={`${entity.name}：${action.name}`} checked={selected.includes(id)} onChange={() => setSelected(toggle(selected, id))} /></td> })}</tr>)}</tbody></table><div className="mt-2 flex gap-3"><Button type="button" variant="ghost" size="sm" onClick={() => setSelected(permissions.map(p => p.id))}>全選</Button><Button type="button" variant="ghost" size="sm" onClick={() => setSelected([])}>清除</Button></div></div>}
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    <div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" onClick={onCancel}>取消</Button><Button type="submit">儲存</Button></div>
  </form>
}
