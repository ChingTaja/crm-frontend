import { createContext, useCallback, useContext, useEffect, useId, useRef } from 'react';
import type { FieldErrors } from '@/lib/form-validation';

export interface ValidationField {
  name: string;
  validate: () => string;
  focus: () => void;
}
export const FormValidationContext = createContext<{
  errors: FieldErrors;
  serverErrors: FieldErrors;
  dismissed: Set<string>;
  register: (key: string, field: ValidationField) => () => void;
  update: (key: string, message: string, name: string) => void;
} | null>(null);

export function useValidatedField(name: string | undefined, id: string | undefined, validation: Pick<ValidationField, 'validate' | 'focus'>) {
  const generated = useId();
  const key = id ?? generated;
  const fieldName = name ?? id?.replace(/^[^-]+-/, '') ?? key;
  const context = useContext(FormValidationContext);
  const callbacks = useRef<Pick<ValidationField, 'validate' | 'focus'> | null>(null);
  const { validate, focus } = validation;
  useEffect(() => { callbacks.current = { validate, focus }; }, [validate, focus]);
  const register = context?.register;
  useEffect(() => {
    if (!register) return;
    return register(key, {
      name: fieldName,
      validate: () => callbacks.current?.validate() ?? '',
      focus: () => callbacks.current?.focus(),
    });
  }, [register, key, fieldName]);
  const error = context?.errors[key] || (!context?.dismissed.has(fieldName) ? context?.serverErrors[fieldName] : '') || '';
  const update = context?.update;
  const clear = useCallback(() => update?.(key, '', fieldName), [update, key, fieldName]);
  return {
    clear,
    id: key, error,
    errorId: `${key}-error`,
    validate: () => context?.update(key, callbacks.current?.validate() ?? '', fieldName),
    change: (message?: string) => context?.update(key, message ?? (error ? callbacks.current?.validate() ?? '' : ''), fieldName),
  };
}
