import { useEffect, useState, type ReactNode } from 'react';
import { AccessContext, useAccess } from '../view-models/use-access';
import { useApi } from '@/hooks/use-api';
import { authApi } from '@/features/auth/models/auth-service';
import { Button } from '@/components/ui/button';
export function AccessProvider({ children, route }: { children: ReactNode; route: string }) {
  const [notice, setNotice] = useState('');
  const { data, error, execute, cancel } = useApi(authApi.currentUser);
  useEffect(() => {
    const refresh = (event?: Event) => { if (event instanceof CustomEvent && typeof event.detail === 'string') setNotice(event.detail); void execute().catch(() => {}); };
    refresh();
    window.addEventListener('crm:permissions-changed', refresh);
    return () => { cancel(); window.removeEventListener('crm:permissions-changed', refresh); };
  }, [route, execute, cancel]);
  const refresh = () => { void execute().catch(() => {}); };
  if (error) return <div role="alert" className="p-8">{error.message}<Button onClick={refresh}>重試</Button></div>;
  if (!data) return <p role="status" className="p-8">載入權限…</p>;
  return <AccessContext.Provider value={{ me: data, can: code => data.permissionCodes.includes(code), refresh }}>{notice && <p role="alert" className="p-3 text-destructive">{notice}<Button variant="ghost" onClick={() => setNotice('')}>關閉</Button></p>}{children}</AccessContext.Provider>;
}
export function AccessPage({ entity, isNew, children }: { entity: string; isNew: boolean; children: ReactNode }) {
  const { can } = useAccess();
  if (entity !== 'dashboard' && (!can(`${entity}.read`) || (isNew && !can(`${entity}.create`)))) return <p role="alert" className="p-8">沒有此頁面的存取權限。</p>;
  return children;
}
