import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function EntityWorkspace({ sidebar, children, relationship = false }: { sidebar: ReactNode; children: ReactNode; relationship?: boolean }) {
  return <div className={cn('grid flex-1 bg-white text-sm', relationship
    ? 'grid-cols-1 text-[#414742] min-[601px]:grid-cols-[185px_minmax(0,1fr)] min-[901px]:grid-cols-[235px_minmax(0,1fr)]'
    : 'md:grid-cols-[235px_minmax(0,1fr)]')}>
    {sidebar}
    <main className={cn('min-w-0', relationship ? 'px-4 min-[901px]:px-6' : 'px-6')}>{children}</main>
  </div>
}
