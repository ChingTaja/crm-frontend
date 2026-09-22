import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const cellClasses = 'h-[58px] border-b border-[#eceeea] px-4 py-4 text-[13px] font-normal not-last:border-r';
const selectionClasses = 'w-10 border-r-0 px-2 py-2.5 text-center';

export function EntityTable({ children }: ComponentProps<'table'>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left whitespace-nowrap">{children}</table>
    </div>
  );
}

export function EntityTableRow({ className, ...props }: ComponentProps<'tr'>) {
  return (
    <tr
      className={cn('transition-colors hover:bg-[#fafbf8] data-[selected=true]:bg-[#f0f5ec]', className)}
      {...props}
    />
  );
}

export function EntityTableHead({ selection, className, ...props }: ComponentProps<'th'> & { selection?: boolean }) {
  return (
    <th
      className={cn(cellClasses, 'h-12 py-2.5 text-xs text-[#939b90]', selection && selectionClasses, className)}
      {...props}
    />
  );
}

export function EntityTableCell({ selection, className, ...props }: ComponentProps<'td'> & { selection?: boolean }) {
  return <td className={cn(cellClasses, selection && selectionClasses, className)} {...props} />;
}

export function EntityRowHeading({ className, ...props }: ComponentProps<'th'>) {
  return <th scope="row" className={cn(cellClasses, className)} {...props} />;
}

export function RowCheckbox({ indeterminate = false, ...props }: Omit<ComponentProps<'input'>, 'type' | 'ref'> & { indeterminate?: boolean }) {
  return <input type="checkbox" ref={element => { if (element) element.indeterminate = indeterminate }} aria-checked={indeterminate ? 'mixed' : props.checked} className="size-4 cursor-pointer align-middle accent-[#527459] disabled:cursor-default disabled:opacity-40" {...props} />;
}
