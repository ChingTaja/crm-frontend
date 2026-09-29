import { useRef } from 'react';
import { useApi } from '@/hooks/use-api';
import { authApi } from '@/features/auth/models/auth-service';
import { AppLink } from '@/components/ui/app-link';
import { Layers, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function WorkspaceHeader({ onReturnToLogin }: { onReturnToLogin: () => void }) {
  const request = useApi(authApi.logout);
  const busy = useRef(false);
  async function logout() {
    if (busy.current) return;
    busy.current = true;
    try { await request.execute(); onReturnToLogin(); }
    catch { /* The server error remains visible; do not pretend logout succeeded. */ }
    finally { busy.current = false; }
  }
  return (
    <header className="border-b bg-white px-4 py-4 sm:px-10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <AppLink
          href="/dashboard"
          aria-label="Connect CRM 首頁"
          className="flex items-center gap-3 rounded-lg text-xl font-semibold transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#56775e]"
        >
          <span className="rounded-xl bg-[#254e3c] p-2 text-white">
            <Layers aria-hidden="true" />
          </span>
          Connect <span className="text-xs font-normal tracking-widest text-muted-foreground">CRM</span>
        </AppLink>
        <Button variant="outline" disabled={request.isLoading} onClick={logout}>
          <LogOut /> {request.isLoading ? '登出中…' : '登出'}
        </Button>
      </div>
      {request.error && <p role="alert" className="mx-auto mt-3 max-w-6xl text-sm text-destructive">登出失敗：{request.error.message}</p>}
    </header>
  );
}
