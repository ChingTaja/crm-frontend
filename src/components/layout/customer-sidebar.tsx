import { AppLink } from '@/components/ui/app-link';
import { Building2, UserRound } from 'lucide-react';

export function CustomerSidebar({ isCustomers }: { isCustomers: boolean }) {
  return (
    <aside
      className="relative flex flex-col border-b border-[#e8ebe7] bg-[#f8f9f8] p-4 min-[601px]:border-r min-[601px]:border-b-0 min-[601px]:px-2 min-[901px]:px-3.5"
      aria-label="工作區導覽"
    >
      <div className="hidden px-3 pb-2.5 text-[11px] tracking-wider text-[#9aa198] min-[601px]:block">工作區</div>
      <nav className="flex gap-1 min-[601px]:grid">
        <AppLink
          href="/customers"
          className="flex flex-1 items-center gap-3 rounded-lg p-3 text-[#737c73] hover:bg-[#eef1ec] aria-[current=page]:bg-[#e9eee7] aria-[current=page]:font-semibold aria-[current=page]:text-[#284c36]"
          aria-current={isCustomers ? 'page' : undefined}
        >
          <Building2 size={19} className="text-[#537966]" /> 客戶{' '}
          <span className="ml-auto text-[10px] text-[#a1aaa0] min-[601px]:max-[900px]:hidden">Customer</span>
        </AppLink>
        <AppLink
          href="/contacts"
          className="flex flex-1 items-center gap-3 rounded-lg p-3 text-[#737c73] hover:bg-[#eef1ec] aria-[current=page]:bg-[#e9eee7] aria-[current=page]:font-semibold aria-[current=page]:text-[#284c36]"
          aria-current={!isCustomers ? 'page' : undefined}
        >
          <UserRound size={19} className="text-[#537966]" /> 聯絡人{' '}
          <span className="ml-auto text-[10px] text-[#a1aaa0] min-[601px]:max-[900px]:hidden">Contact</span>
        </AppLink>
      </nav>
    </aside>
  );
}
