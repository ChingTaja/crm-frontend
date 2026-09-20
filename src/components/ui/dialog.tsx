import type { ComponentProps } from 'react';
import { Dialog as Primitive } from '@base-ui/react/dialog';
import { cn } from '@/lib/utils';

export const Dialog = Primitive.Root;
export const DialogTitle = Primitive.Title;
export const DialogDescription = Primitive.Description;
export const DialogClose = Primitive.Close;
export function DialogContent({ className, ...props }: ComponentProps<typeof Primitive.Popup>) {
  return (
    <Primitive.Portal>
      <Primitive.Backdrop className="fixed inset-0 z-50 bg-black/35" />
      <Primitive.Popup
        className={cn(
          'fixed top-1/2 left-1/2 z-50 max-h-[85svh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border bg-background p-6 shadow-xl outline-none',
          className
        )}
        {...props}
      />
    </Primitive.Portal>
  );
}
