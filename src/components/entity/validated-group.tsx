import { useEffect, useRef, type ReactNode } from 'react';
import { useValidatedField } from './form-validation-context';
import { FieldError } from './field-error';

export function ValidatedGroup({ name, validate, children }: { name: string; validate: () => string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const field = useValidatedField(name, undefined, { validate, focus: () => ref.current?.focus() });
  const message = validate();
  const { clear } = field;
  useEffect(() => { if (!message) clear(); }, [message, clear]);
  return <div ref={ref} tabIndex={-1} aria-invalid={!!field.error} aria-describedby={field.error ? field.errorId : undefined} className={field.error ? 'rounded-xl border border-destructive p-2' : undefined}>
    {children}
    <FieldError id={field.errorId} error={field.error} />
  </div>;
}
