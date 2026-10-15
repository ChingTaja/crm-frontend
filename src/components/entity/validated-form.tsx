import { useCallback, useMemo, useRef, useState, type ComponentProps } from 'react';
import { FormValidationContext, type ValidationField } from './form-validation-context';
import { requestFieldErrors, type FieldErrors } from '@/lib/form-validation';

const emptyErrors: FieldErrors = {};
export function ValidatedForm({ onSubmit, onReset, fieldErrors, requestError, ...props }: ComponentProps<'form'> & { fieldErrors?: FieldErrors; requestError?: unknown }) {
  const serverErrors = useMemo(() => fieldErrors ?? (requestError ? requestFieldErrors(requestError) : emptyErrors), [fieldErrors, requestError]);
  const fields = useRef(new Map<string, ValidationField>());
  const [errors, setErrors] = useState<FieldErrors>({});
  const [dismissal, setDismissal] = useState<{ source: FieldErrors; names: Set<string> }>({ source: serverErrors, names: new Set() });
  const register = useCallback((key: string, field: ValidationField) => {
    fields.current.set(key, field);
    return () => { fields.current.delete(key); };
  }, []);
  const update = useCallback((key: string, message: string, name: string) => {
    setErrors(current => ({ ...current, [key]: message }));
    setDismissal(current => ({ source: serverErrors, names: new Set([...(current.source === serverErrors ? current.names : []), name]) }));
  }, [serverErrors]);
  return <FormValidationContext.Provider value={{ errors, serverErrors, dismissed: dismissal.source === serverErrors ? dismissal.names : new Set(), register, update }}>
    <form {...props} noValidate onSubmit={event => {
      const next: FieldErrors = {};
      let first: ValidationField | undefined;
      for (const [key, field] of fields.current) {
        const message = field.validate();
        if (message) { next[key] = message; first ??= field; }
      }
      setErrors(next);
      if (first) { event.preventDefault(); first.focus(); return; }
      onSubmit?.(event);
    }} onReset={event => {
      setErrors({});
      setDismissal({ source: serverErrors, names: new Set(Object.keys(serverErrors)) });
      onReset?.(event);
    }} />
  </FormValidationContext.Provider>;
}
