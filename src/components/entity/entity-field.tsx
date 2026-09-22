import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'

export function EntityField({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label>{children}</div>
}
