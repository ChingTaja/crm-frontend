import { ShieldCheck, LockKeyhole, X, Search, Check, Trash2, LoaderCircle } from 'lucide-react';
import { permissionOptions } from '../models/permission-options';
import { Input } from '@/components/ui/input';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { RoleDetailResponse } from '../../../api/Api';
import { roleApi } from '../models/role-service';
import { useAccess } from '../view-models/use-access';
import { useApi } from '@/hooks/use-api';
import { usePaginatedQuery } from '@/hooks/use-paginated-query';
import { useEntityFields } from '@/hooks/use-entity-fields';
import { metadataRows } from '@/lib/entity-fields';
import { EntityWorkspace } from '@/components/layout/entity-workspace';
import { AccessSidebar } from '@/components/layout/access-sidebar';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';

export function AccessView({ section }: { section: 'users' | 'roles' }) {
  const access = useAccess();
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const request = useCallback((signal: AbortSignal, page: { page: number; size: number }) => roleApi.list(signal, { ...page, keyword: search }), [search]);
  const query = usePaginatedQuery(request);
  const metadata = useEntityFields('roles');
  const deletion = useApi(roleApi.remove);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fields = metadata.fields.filter(field => !['revision', 'version'].includes(field.apiFieldName ?? ''));
  const deletingRole = query.records.find(role => role.id === deleting);
  const rows = metadataRows(query.records, fields);
  async function remove() {
    if (!deleting || deletion.isLoading) return;
    try { await deletion.execute(deleting); setDeleting(null); await query.reload(); access.refresh(); } catch { /* API error displayed below. */ }
  }
  return <EntityWorkspace sidebar={<AccessSidebar section={section} />}><div className="space-y-4 py-6">
    <div className="flex justify-between"><h1 className="text-xl font-semibold">角色權限</h1>{access.can('roles.create') && access.can('permissions.read') && <Button onClick={() => setEditing('')}>新增角色</Button>}</div>
    <form className="flex gap-2" onSubmit={e => { e.preventDefault(); query.pagination.setPage(1); setSearch(keyword.trim()); }}><input aria-label="搜尋角色" className="rounded border p-2" placeholder="代碼或名稱" value={keyword} onChange={e => setKeyword(e.target.value)} /><Button type="submit">搜尋</Button></form>
    {(query.error || metadata.error || deletion.error) && <div role="alert">{query.error?.message || metadata.error?.message || deletion.error?.message}<Button onClick={() => { void Promise.all([query.reload(), metadata.reload()]).catch(() => {}); }}>重試</Button></div>}
    {(query.isLoading || metadata.isLoading) && <p role="status">載入角色…</p>}
    <table className="w-full text-left text-sm"><thead><tr>{fields.map(f => <th className="p-3" key={f.apiFieldName}>{f.label}</th>)}<th>操作</th></tr></thead><tbody>{rows.map((row, index) => {
      const role = query.records[index];
      return <tr key={row.id} className="border-t">{row.displayValues.map((v, i) => <td className="p-3" key={i}>{v || '—'}</td>)}<td><Button variant="ghost" onClick={() => setEditing(role.id)}>查看</Button>{!role.system && role.id !== access.me?.role.id && role.userCount === 0 && access.can('roles.delete') && <Button variant="ghost" onClick={() => { deletion.reset(); setDeleting(role.id); }}>刪除</Button>}</td></tr>;
    })}</tbody></table>
    <label>每頁筆數<select className="ml-2 rounded border p-2" value={query.pagination.pageSize} onChange={e => { query.pagination.setPage(1); query.pagination.setPageSize(Number(e.target.value)); }}>{[5,10,20,50,100].map(size => <option key={size}>{size}</option>)}</select> · 共 {query.pagination.total} 筆</label>
    <Pagination page={query.pagination.page} pageCount={query.pagination.pageCount} onPageChange={query.pagination.setPage} />
    <Dialog open={editing !== null} onOpenChange={open => { if (!open) setEditing(null); }}><DialogContent className="flex max-h-[90svh] max-w-3xl flex-col overflow-hidden p-0">{editing !== null && <RoleEditor key={editing} id={editing} done={() => { setEditing(null); void query.reload().catch(() => {}); access.refresh(); }} />}</DialogContent></Dialog>
    <Dialog open={!!deleting} onOpenChange={open => { if (!open && !deletion.isLoading) setDeleting(null); }}>
      <DialogContent className="max-w-md overflow-hidden p-0">
        <div className="space-y-5 p-6">
          <div className="flex items-start justify-between gap-4">
            <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive"><Trash2 size={22} aria-hidden="true" /></span>
            <DialogClose render={<Button type="button" variant="ghost" size="icon" disabled={deletion.isLoading} aria-label="關閉刪除角色視窗"><X size={18} /></Button>} />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-xl font-semibold tracking-tight">刪除角色？</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">刪除後無法復原，請確認要移除的角色。</DialogDescription>
          </div>
          <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-4">
            <ShieldCheck size={20} className="shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0"><p className="break-words font-medium">{deletingRole?.name ?? '所選角色'}</p><p className="mt-1 break-all font-mono text-xs text-muted-foreground">{deletingRole?.code}</p></div>
          </div>
          {deletion.error && <p role="alert" className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm leading-relaxed text-destructive">{deletion.error.message}</p>}
        </div>
        <footer className="flex justify-end gap-3 border-t bg-muted/20 px-6 py-4">
          <DialogClose render={<Button type="button" variant="outline" disabled={deletion.isLoading} autoFocus>取消</Button>} />
          <Button type="button" variant="destructive" disabled={deletion.isLoading} onClick={() => void remove()}>
            {deletion.isLoading ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Trash2 size={16} aria-hidden="true" />}
            {deletion.isLoading ? '刪除中…' : '刪除角色'}
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  </div></EntityWorkspace>;
}
function RoleEditor({ id, done }: { id: string; done: () => void }) {
  const access = useAccess();
  const detail = useApi(roleApi.get);
  const catalog = useApi(roleApi.permissions);
  const { execute, cancel } = detail;
  const { execute: loadPermissions, cancel: cancelPermissions } = catalog;
  const readCatalog = access.can('permissions.read');
  useEffect(() => { if (id) void execute(id).catch(() => {}); if (readCatalog) void loadPermissions().catch(() => {}); return () => { cancel(); cancelPermissions(); }; }, [id, execute, cancel, loadPermissions, cancelPermissions, readCatalog]);
  return <><header className="flex shrink-0 items-start gap-3 border-b bg-muted/30 px-6 py-5">
    <span className="rounded-xl bg-emerald-100 p-2.5 text-emerald-800"><ShieldCheck size={22} /></span>
    <div className="flex-1"><DialogTitle className="text-lg font-semibold">{detail.data?.name || (id ? '角色資料' : '新增角色')}</DialogTitle><DialogDescription className="mt-1 text-sm text-muted-foreground">管理角色資料與功能存取權限</DialogDescription></div>
    <DialogClose render={<Button variant="ghost" size="icon" aria-label="關閉角色視窗"><X size={18} /></Button>} />
  </header>
  {id && detail.isLoading && <p role="status" className="p-6 text-sm text-muted-foreground">載入角色資料…</p>}
    {(detail.error || catalog.error) && <p role="alert">{detail.error?.message || catalog.error?.message}<Button onClick={() => { if (id) void execute(id).catch(() => {}); if (readCatalog) void loadPermissions().catch(() => {}); }}>重新載入</Button></p>}
    {(!id || detail.data) && !detail.isLoading && <RoleForm key={detail.data?.revision ?? 'new'} record={detail.data} catalog={catalog.data ?? []} catalogReady={!!catalog.data && !catalog.error && !catalog.isLoading} done={done} reload={() => { void execute(id).catch(() => {}); }} />}
  </>;
}
function RoleForm({ record, catalog, catalogReady, done, reload }: { record?: RoleDetailResponse; catalog: import('../../../api/Api').PermissionResponse[]; catalogReady: boolean; done: () => void; reload: () => void }) {
  const { me, can } = useAccess();
  const [code, setCode] = useState('');
  const [name, setName] = useState(record?.name ?? '');
  const [description, setDescription] = useState(record?.description ?? '');
  const [permissionSearch, setPermissionSearch] = useState('');
  const [selected, setSelected] = useState(record?.permissionCodes ?? []);
  const create = useApi(roleApi.create), update = useApi(roleApi.update);
  const busy = useRef(false);
  const editable = can(record ? 'roles.update' : 'roles.create') && catalogReady && !record?.system && record?.id !== me?.role.id && (record?.permissionCodes ?? []).every(can);
  const saving = create.isLoading || update.isLoading;
  async function save(event: React.FormEvent) {
    event.preventDefault(); if (!editable || busy.current) return; busy.current = true;
    try {
      const fields = { name: name.trim(), description: description.trim(), permissionCodes: selected };
      if (record) await update.execute(record.id, { ...fields, expectedRevision: record.revision });
      else await create.execute({ ...fields, code: code.trim().toUpperCase() });
      done();
    } catch { /* Preserve edits and the original revision until explicit reload. */ } finally { busy.current = false; }
  }
  const options = permissionOptions(catalog);
  const groups = [...new Set(options.map(p => p.groupName))];
  const readonlyReason = record?.system ? '內建角色由系統維護' : record?.id === me?.role.id ? '不可修改自己的角色' : !editable ? '此角色僅供檢視' : '';
  return <form onSubmit={save} className="flex min-h-0 flex-1 flex-col">
    <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
      <section className="space-y-4">
        <div className="flex items-center justify-between"><h2 className="font-semibold">基本資料</h2>{record && <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">{record.system ? '內建角色' : '自訂角色'} · {record.userCount} 位使用者</span>}</div>
        {editable ? <fieldset disabled={saving} className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm"><span>角色名稱 *</span><Input required maxLength={100} value={name} onChange={e => setName(e.target.value)} /></label>
          <label className="space-y-2 text-sm"><span>角色代碼 *</span><Input required pattern="[A-Za-z][A-Za-z0-9_]{1,49}" maxLength={50} readOnly={!!record} className={record ? 'bg-muted text-muted-foreground' : ''} value={record?.code ?? code} onChange={e => setCode(e.target.value)} /></label>
          <label className="space-y-2 text-sm sm:col-span-2"><span>說明</span><textarea className="min-h-20 w-full resize-y rounded-lg border bg-background p-3" maxLength={2000} value={description} placeholder="說明這個角色的工作範圍" onChange={e => setDescription(e.target.value)} /></label>
        </fieldset> : <dl className="grid gap-4 rounded-xl bg-muted/40 p-4 text-sm sm:grid-cols-2"><div><dt className="text-muted-foreground">角色名稱</dt><dd className="mt-1 font-medium">{record?.name || '—'}</dd></div><div><dt className="text-muted-foreground">角色代碼</dt><dd className="mt-1 font-mono">{record?.code || '—'}</dd></div><div className="sm:col-span-2"><dt className="text-muted-foreground">說明</dt><dd className="mt-1 whitespace-pre-wrap">{record?.description || '未填寫'}</dd></div></dl>}
      </section>
      <section className="space-y-3">
        <div className="flex items-center justify-between"><h2 className="font-semibold">功能權限</h2><span className="text-xs text-muted-foreground">{options.filter(p => p.codes.every(code => selected.includes(code))).length} / {options.length} 項</span></div>
        <div className="relative"><Search size={16} className="absolute top-3 left-3 text-muted-foreground" /><Input aria-label="搜尋功能權限" className="pl-9" placeholder="搜尋模組或功能" value={permissionSearch} onChange={e => setPermissionSearch(e.target.value)} /></div>
        <div className="space-y-3">{groups.map(group => {
          const visible = options.filter(p => p.groupName === group && `${group} ${p.name}`.toLocaleLowerCase().includes(permissionSearch.trim().toLocaleLowerCase()));
          if (!visible.length) return null;
          return <section key={group} className="overflow-hidden rounded-xl border"><h3 className="border-b bg-muted/40 px-4 py-3 text-sm font-semibold">{group}</h3><div className="grid gap-2 p-3 sm:grid-cols-2">{visible.map(p => {
            const checked = p.codes.every(code => selected.includes(code));
            const partial = !checked && p.codes.some(code => selected.includes(code));
            const grantable = p.codes.every(can);
            return <label key={p.code} className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${checked ? 'border-emerald-200 bg-emerald-50/60' : 'border-transparent bg-muted/20'} ${editable && grantable ? 'cursor-pointer hover:border-emerald-300' : ''}`}>
              {editable ? <input type="checkbox" className="mt-0.5 size-4 accent-emerald-700" disabled={saving || !grantable} checked={checked} ref={element => { if (element) element.indeterminate = partial; }} onChange={e => setSelected(e.target.checked ? [...new Set([...selected, ...p.codes])] : selected.filter(code => !p.codes.includes(code)))} /> : <span className="mt-0.5 text-emerald-700">{checked ? <Check size={16} /> : partial ? '−' : <span className="block size-4 rounded border" />}</span>}
              <span><span className="font-medium">{p.name}</span>{p.description && <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{p.description}</span>}{partial && <span className="mt-1 block text-xs text-amber-700">部分授權</span>}</span>
            </label>;
          })}</div></section>;
        })}</div>
        {!catalogReady && <p className="rounded-lg bg-muted p-3 text-sm">{selected.length ? selected.join('、') : '尚無權限資料'}</p>}
      </section>
      {(create.error || update.error) && <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{create.error?.message || update.error?.message}{record && <Button type="button" variant="outline" className="mt-2" onClick={reload}>重新載入（捨棄修改）</Button>}</div>}
    </div>
    <footer className="flex shrink-0 items-center justify-between gap-3 border-t bg-background px-6 py-4"><p className="flex items-center gap-2 text-xs text-muted-foreground">{readonlyReason && <><LockKeyhole size={14} />{readonlyReason}</>}</p><div className="flex gap-2"><DialogClose render={<Button type="button" variant="outline" disabled={saving}>{editable ? '取消' : '關閉'}</Button>} />{editable && <Button type="submit" disabled={saving || !name.trim()}>{saving ? '儲存中…' : '儲存變更'}</Button>}</div></footer>
  </form>;
}
