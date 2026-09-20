import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function CustomerPageHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <header
      className={cn(
        'flex min-h-[70px] flex-wrap items-center justify-between gap-3 border-b border-[#e8ebe7] py-4 min-[601px]:gap-5',
        className
      )}
    >
      {children}
    </header>
  );
}

export function CustomerPageTitle({ children }: { children: ReactNode }) {
  return <h1 className="flex items-center gap-2 text-base font-semibold whitespace-nowrap">{children}</h1>;
}
