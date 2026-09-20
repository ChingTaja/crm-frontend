import { Layers, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function WorkspaceHeader({ onReturnToLogin }: { onReturnToLogin: () => void }) {
  return (
    <header className="border-b bg-white px-4 py-4 sm:px-10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <a
          href="#/dashboard"
          aria-label="Connect CRM 首頁"
          className="flex items-center gap-3 rounded-lg text-xl font-semibold transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#56775e]"
        >
          <span className="rounded-xl bg-[#254e3c] p-2 text-white">
            <Layers aria-hidden="true" />
          </span>
          Connect <span className="text-xs font-normal tracking-widest text-muted-foreground">CRM</span>
        </a>
        <Button variant="outline" onClick={onReturnToLogin}>
          <LogOut /> 返回登入頁
        </Button>
      </div>
    </header>
  );
}
