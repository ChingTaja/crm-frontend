import type { ComponentProps } from 'react'
import { Popover as Primitive } from '@base-ui/react/popover'
import { cn } from '@/lib/utils'

export const Popover = Primitive.Root
export const PopoverTrigger = Primitive.Trigger
export const PopoverTitle = Primitive.Title
export const PopoverClose = Primitive.Close

export function PopoverContent({ className, ...props }: ComponentProps<typeof Primitive.Popup>) {
  return (
    <Primitive.Portal>
      <Primitive.Positioner sideOffset={8} align="end" className="z-50">
        <Primitive.Popup className={cn('w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-xl outline-none', className)} {...props} />
      </Primitive.Positioner>
    </Primitive.Portal>
  )
}
