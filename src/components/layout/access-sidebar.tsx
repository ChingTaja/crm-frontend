import { ShieldCheck, Users } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';

const links = [
  { id: 'users', label: '帳號管理', icon: Users },
  { id: 'roles', label: '角色權限', icon: ShieldCheck },
] as const;

export function AccessSidebar({ section }: { section: 'users' | 'roles' }) {
  return <aside className="border-r bg-[#f8f9f8] p-4">
    <p className="mb-3 px-3 text-xs text-muted-foreground">權限管理</p>
    <nav className="flex gap-1 md:grid">
      {links.map(({ id, label, icon: Icon }) => <AppLink key={id} href={`/${id}`}
        aria-current={section === id ? 'page' : undefined}
        className="flex items-center gap-2 rounded-lg p-3 text-muted-foreground hover:bg-muted aria-[current=page]:bg-[#e9eee7] aria-[current=page]:text-[#284c36]">
        <Icon size={18} />{label}
      </AppLink>)}
    </nav>
  </aside>;
}
