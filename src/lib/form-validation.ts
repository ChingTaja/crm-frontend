export type FieldErrors = Record<string, string>;

export class FieldValidationError extends Error {
  constructor(public readonly fieldErrors: FieldErrors) {
    super(Object.values(fieldErrors).join(' '));
    this.name = 'FieldValidationError';
  }
}

export function requestFieldErrors(error: unknown): FieldErrors {
  if (error instanceof FieldValidationError) return error.fieldErrors;
  if (!error || typeof error !== 'object') return {};
  const details = 'details' in error ? error.details : undefined;
  if (!details || typeof details !== 'object') return {};
  const body = details as Record<string, unknown>;
  const entries = body.fieldErrors ?? body.errors ?? body.violations;
  const result: FieldErrors = {};
  if (Array.isArray(entries)) {
    for (const entry of entries) {
      if (!entry || typeof entry !== 'object') continue;
      const field = entry.field ?? entry.propertyPath;
      const message = entry.message ?? entry.defaultMessage;
      if (typeof field === 'string' && typeof message === 'string') result[field] = message;
    }
  } else if (entries && typeof entries === 'object') {
    for (const [field, message] of Object.entries(entries)) {
      if (typeof message === 'string') result[field] = message;
      else if (Array.isArray(message) && message.every(value => typeof value === 'string')) result[field] = message.join(' ');
    }
  }
  return result;
}

export function validityMessage(control: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): string {
  if (control.disabled || control.matches(':disabled') || ('readOnly' in control && control.readOnly)) return '';
  const validity = control.validity;
  if (validity.badInput) return '請輸入有效的數字。';
  if (control.required && !control.value.trim()) return '此欄位為必填。';
  if (validity.valueMissing) return '此欄位為必填。';
  if (validity.typeMismatch) return control.type === 'email' ? '請輸入有效的電子郵件地址。' : '請輸入有效的格式。';
  if (validity.rangeUnderflow) return control.type === 'date'
    ? `日期須為 ${control.getAttribute('min')} 或之後。`
    : `數值不得小於 ${control.getAttribute('min')}。`;
  if (validity.rangeOverflow) return `數值不得大於 ${control.getAttribute('max')}。`;
  if (validity.stepMismatch) return `請輸入符合間隔 ${control.getAttribute('step') || '1'} 的數值。`;
  if (validity.patternMismatch) return control.title || '格式不正確，請確認輸入內容。';
  if (control.value && control.getAttribute('minlength') && control.value.length < Number(control.getAttribute('minlength'))) return `至少需要 ${control.getAttribute('minlength')} 個字元。`;
  if (validity.tooShort) return `至少需要 ${control.getAttribute('minlength')} 個字元。`;
  if (validity.tooLong) return `最多可輸入 ${control.getAttribute('maxlength')} 個字元。`;
  return validity.valid ? '' : control.validationMessage;
}
