import type { ComponentProps, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function LoginInput({ icon: Icon, children, ...props }: Omit<ComponentProps<typeof Input>, 'className'> & { icon: LucideIcon; children?: ReactNode }) {
  return (
    <div className="flex h-12 items-center gap-3 rounded-lg border border-[#dfe5df] px-3.5 text-[#9aa69d] transition-shadow focus-within:border-[#64856b] focus-within:ring-3 focus-within:ring-[#64856b]/10">
      <Icon size={18} aria-hidden="true" />
      <Input className="h-full min-w-0 rounded-none border-0 bg-transparent px-0 text-[13px] text-[#263d37] shadow-none placeholder:text-[#a4ada5] focus-visible:ring-0 md:text-[13px]" {...props} />
      {children}
    </div>
  )
}
