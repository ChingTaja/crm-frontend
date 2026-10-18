import { useAccess } from '@/features/access/view-models/use-access';
import { AppLink } from '@/components/ui/app-link';
import { ArrowLeft, FileText, Handshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { navigate } from '@/lib/router';

export function OpportunityTabs({ quotes = false, recordId }: { quotes?: boolean; recordId: string }) {
  const { can } = useAccess();
  const base = `/opportunities/${encodeURIComponent(recordId)}/edit`;
  return <nav aria-label="商機資料分頁" className="flex gap-6 border-b pt-5">
    {quotes && <Button type="button" variant="ghost" size="icon" className="-mt-1 shrink-0" aria-label="返回商機列表" onClick={() => navigate('/opportunities')}><ArrowLeft /></Button>}
    {[{ label: '商機資料', href: base, active: !quotes, icon: Handshake }, { label: '報價單', href: `${base}?tab=quotes`, active: quotes, icon: FileText }].filter(tab => tab.label !== '報價單' || can('quotes.read')).map(({ label, href, active, icon: Icon }) => <AppLink key={label} href={href} aria-current={active ? 'page' : undefined} className="inline-flex items-center gap-2 border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:border-primary aria-[current=page]:text-foreground"><Icon aria-hidden="true" className="size-4" />{label}</AppLink>)}
  </nav>;
}
