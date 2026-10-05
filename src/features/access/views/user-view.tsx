import { useAccess } from '../view-models/use-access';
import { roleApi } from '../models/role-service';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { RegisterRequest, UserResponse } from '../../../api/Api';
import { userApi } from '../models/user-service';
import { useApi } from '@/hooks/use-api';
import { usePaginatedQuery } from '@/hooks/use-paginated-query';
import { useEntityFields } from '@/hooks/use-entity-fields';
import { useEntityList } from '@/hooks/use-entity-list';
import { metadataRows } from '@/lib/entity-fields';
import { EntityList } from '@/components/entity/entity-list';
import { EntityWorkspace } from '@/components/layout/entity-workspace';
import { AccessSidebar } from '@/components/layout/access-sidebar';
import { Lookup, type LookupOption } from '@/components/ui/lookup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const defaultRoleId = '055a46a66-27a6-4e6f-8e06-de8f448f935f';

export function UserView() {
  const access = useAccess();
  const query = usePaginatedQuery(userApi.list);
  const metadata = useEntityFields('users');
  const deletion = useApi(userApi.removeMany);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const metadataFields = metadata.fields;
  const optionsRequest = useApi(roleApi.options);
  const { execute: loadOptions, cancel: cancelOptions } = optionsRequest;
  const canLoadOptions = access.can('users.create') || access.can('users.update') || access.can('users.assign-role');
  useEffect(() => {
    if (canLoadOptions) void loadOptions().catch(() => {});
    return cancelOptions;
  }, [loadOptions, cancelOptions, canLoadOptions]);
  const roleOptions = (optionsRequest.data ?? []).map((role) => ({ value: role.id, label: role.name }));
  const fields = metadataFields.map((field) =>
    ['role', 'roleId', 'role.id'].includes(field.apiFieldName ?? '') ? { ...field, options: roleOptions } : field
  );
  const rows = metadataRows(
    query.records.map((user) => ({ ...user, name: user.username, roleId: user.role?.id })),
    fields
  );
  async function removeMany(ids: string[]) {
    const result = await deletion.execute(ids);
    await query.reload();
    if (result.failed.length)
      throw new Error(
        `已刪除 ${result.deleted.length} 筆，${result.failed.length} 筆失敗：${result.failed[0].message}`
      );
  }
  const list = useEntityList('users', '帳號', fields, rows, removeMany, true, query.pagination);
  const vm = {
    ...list,
    openDetails: (id: string) => setEditingId(id),
    startCreate: () => {
      setNotice('');
      setEditingId('');
    },
  };
  const error = metadata.error ?? query.error;
  function reload() {
    void Promise.all([metadata.reload(), query.reload()]).catch(() => {});
  }
  function saved() {
    setEditingId(null);
    setSaving(false);
    setNotice('帳號已儲存。');
    access.refresh();
    list.clearSelection();
    void query.reload().catch(() => {});
  }
  return (
    <EntityWorkspace sidebar={<AccessSidebar section="users" />}>
      {notice && (
        <p role="status" className="py-3 text-sm">
          {notice}
        </p>
      )}
      {error ? (
        <div role="alert" className="flex items-center gap-3 py-6 text-sm text-destructive">
          無法載入帳號：{error.message}
          <Button variant="outline" onClick={reload}>
            重試
          </Button>
        </div>
      ) : !metadata.data || !query.data || query.isLoading ? (
        <p role="status" className="py-6">
          載入帳號…
        </p>
      ) : (
        <EntityList vm={vm} dataNotice={null} />
      )}
      {optionsRequest.error && (
        <p role="alert">
          {optionsRequest.error.message}
          <Button
            onClick={() => {
              void loadOptions().catch(() => {});
            }}
          >
            重新載入角色
          </Button>
        </p>
      )}
      <Dialog
        open={editingId !== null}
        onOpenChange={(open) => {
          if (!open && !saving) setEditingId(null);
        }}
      >
        <DialogContent>
          {editingId !== null && (
            <UserEditor
              key={editingId}
              id={editingId}
              roleOptions={roleOptions}
              onCancel={() => setEditingId(null)}
              onSaved={saved}
              onSaving={setSaving}
            />
          )}
        </DialogContent>
      </Dialog>
    </EntityWorkspace>
  );
}

function UserEditor({
  id,
  roleOptions,
  onCancel,
  onSaved,
  onSaving,
}: {
  id: string;
  roleOptions: LookupOption[];
  onCancel: () => void;
  onSaved: () => void;
  onSaving: (value: boolean) => void;
}) {
  const { execute, cancel, data, error } = useApi(userApi.get);
  useEffect(() => {
    if (id) void execute(id).catch(() => {});
    return cancel;
  }, [id, execute, cancel]);
  if (id && !data)
    return (
      <>
        <DialogTitle>修改帳號</DialogTitle>
        <DialogDescription>載入帳號資料</DialogDescription>
        {error ? (
          <div role="alert">
            {error.message}
            <Button
              onClick={() => {
                void execute(id).catch(() => {});
              }}
            >
              重試
            </Button>
          </div>
        ) : (
          <p role="status">載入中…</p>
        )}
      </>
    );
  return <UserForm user={data} roleOptions={roleOptions} onCancel={onCancel} onSaved={onSaved} onSaving={onSaving} />;
}

function UserForm({
  user,
  roleOptions,
  onCancel,
  onSaved,
  onSaving,
}: {
  user?: UserResponse;
  roleOptions: LookupOption[];
  onCancel: () => void;
  onSaved: () => void;
  onSaving: (value: boolean) => void;
}) {
  const access = useAccess();
  const editable = access.can(user ? 'users.update' : 'users.create');
  const canAssign = access.can('users.assign-role') && user?.id !== access.me?.id;
  const [draft, setDraft] = useState<RegisterRequest>({
    username: user?.username ?? '',
    email: user?.email ?? '',
    password: '',
    roleId: user ? (user.role?.id ?? '') : defaultRoleId,
  });
  const create = useApi(userApi.create);
  const update = useApi(userApi.update);
  const [validationError, setValidationError] = useState('');
  const busy = useRef(false);
  const isSaving = create.isLoading || update.isLoading;
  const options = [
    ...new Map(
      [
        ...roleOptions,
        ...(user?.role?.id ? [{ value: user.role.id, label: user.role.name || user.role.code || user.role.id }] : []),
      ].map((role) => [role.value, role])
    ).values(),
  ];
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || !editable) return;
    if (!draft.username.trim()) {
      setValidationError('請輸入帳號。');
      return;
    }
    if (!draft.roleId) {
      setValidationError('請選擇角色。');
      return;
    }
    if (!user && !roleOptions.some((role) => role.value === draft.roleId)) {
      setValidationError('請選擇可指派的角色。');
      return;
    }
    setValidationError('');
    busy.current = true;
    onSaving(true);
    try {
      const fields = { username: draft.username.trim(), email: draft.email.trim() };
      if (user?.id)
        await update.execute(user.id, {
          ...fields,
          ...(canAssign && draft.roleId !== user.role?.id ? { roleId: draft.roleId } : {}),
        });
      else
        await create.execute({
          ...fields,
          password: draft.password,
          roleId: draft.roleId,
        });
      setDraft({ username: '', email: '', password: '' });
      onSaved();
    } catch {
      /* Keep the form open and show the API error. */
    } finally {
      busy.current = false;
      onSaving(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-5" aria-busy={isSaving}>
      <DialogTitle>{user ? (editable ? '修改帳號' : '查看帳號') : '新增帳號'}</DialogTitle>
      <DialogDescription>
        {!editable ? '帳號資料僅供查看。' : user ? '更新帳號、電子郵件及角色。' : '設定帳號、電子郵件、密碼及角色。'}
      </DialogDescription>
      <fieldset disabled={isSaving || !editable} className="space-y-4">
        <label className="grid gap-2">
          帳號
          <Input
            required
            type="text"
            maxLength={100}
            autoComplete="username"
            value={draft.username}
            onChange={(event) => setDraft({ ...draft, username: event.target.value })}
          />
        </label>
        <label className="grid gap-2">
          Email
          <Input
            required
            type="email"
            maxLength={254}
            autoComplete="email"
            value={draft.email}
            onChange={(event) => setDraft({ ...draft, email: event.target.value })}
          />
        </label>
        {!user && (
          <label className="grid gap-2">
            密碼
            <Input
              required
              type="password"
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              value={draft.password}
              onChange={(event) => setDraft({ ...draft, password: event.target.value })}
            />
            <span className="text-xs text-muted-foreground">8–72 個字元</span>
          </label>
        )}
        <div className="space-y-2">
          <p>角色 *</p>
          <Lookup
            label="角色"
            required
            disabled={isSaving || !editable || (!!user && !canAssign)}
            value={draft.roleId ?? ''}
            onValueChange={(roleId) => setDraft({ ...draft, roleId })}
            options={options}
          />
          {!options.length && <p className="text-sm text-muted-foreground">目前沒有可選的角色。</p>}
        </div>
      </fieldset>
      {(validationError || create.error || update.error) && (
        <p role="alert" className="text-sm text-destructive">
          {validationError || create.error?.message || update.error?.message}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" disabled={isSaving} onClick={onCancel}>
          取消
        </Button>
        {editable && (
          <Button type="submit" disabled={isSaving}>
            {isSaving ? '儲存中…' : '儲存'}
          </Button>
        )}
      </div>
    </form>
  );
}
