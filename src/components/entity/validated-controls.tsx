import { useRef, type ComponentProps } from 'react';
import { useValidatedField } from './form-validation-context';
import { FieldError } from './field-error';
import { validityMessage } from '@/lib/form-validation';
import { cn } from '@/lib/utils';

function useControl<T extends HTMLSelectElement | HTMLTextAreaElement>(props: ComponentProps<'select'> | ComponentProps<'textarea'>) {
  const ref = useRef<T | null>(null);
  const field = useValidatedField(props.name, props.id, { validate: () => ref.current ? validityMessage(ref.current) : '', focus: () => ref.current?.focus() });
  return { field, ref, accessibility: {
    id: field.id,
    'aria-invalid': field.error ? true : props['aria-invalid'],
    'aria-describedby': [props['aria-describedby'], field.error ? field.errorId : undefined].filter(Boolean).join(' ') || undefined,
    className: cn(props.className, field.error && 'border-destructive ring-1 ring-destructive'),
  } };
}
export function ValidatedSelect(props: ComponentProps<'select'>) {
  const { field, ref, accessibility } = useControl<HTMLSelectElement>(props);
  return <><select {...props} {...accessibility} ref={ref} onBlur={event => { props.onBlur?.(event); field.validate(); }} onChange={event => { props.onChange?.(event); field.change(); }} /><FieldError id={field.errorId} error={field.error} /></>;
}
export function ValidatedTextarea(props: ComponentProps<'textarea'>) {
  const { field, ref, accessibility } = useControl<HTMLTextAreaElement>(props);
  return <><textarea {...props} {...accessibility} ref={ref} onBlur={event => { props.onBlur?.(event); field.validate(); }} onChange={event => { props.onChange?.(event); field.change(); }} /><FieldError id={field.errorId} error={field.error} /></>;
}
