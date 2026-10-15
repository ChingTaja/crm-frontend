import * as React from 'react';
import { useValidatedField } from '@/components/entity/form-validation-context';
import { FieldError } from '@/components/entity/field-error';
import { validityMessage } from '@/lib/form-validation';
import { cn } from '@/lib/utils';

function Input({ className, type, ref: forwardedRef, ...props }: React.ComponentProps<'input'>) {
  const control = React.useRef<HTMLInputElement | null>(null);
  React.useImperativeHandle(forwardedRef, () => control.current!, []);
  const field = useValidatedField(props.name, props.id, { validate: () => control.current ? validityMessage(control.current) : '', focus: () => control.current?.focus() });
  return (
    <><input
      type={type}
      data-slot="input"
      className={cn(
        'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
        className
      )}
      {...props}
      id={field.id}
      ref={control}
      aria-invalid={field.error ? true : props['aria-invalid']}
      aria-describedby={[props['aria-describedby'], field.error ? field.errorId : undefined].filter(Boolean).join(' ') || undefined}
      onBlur={event => { props.onBlur?.(event); field.validate(); }}
      onChange={event => { props.onChange?.(event); field.change(); }}
    /><FieldError id={field.errorId} error={field.error} /></>
  );
}

export { Input };
