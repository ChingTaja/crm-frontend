export function FieldError({ id, error }: { id: string; error: string }) {
  return error ? <p id={id} role="alert" className="mt-1 text-xs text-destructive">{error}</p> : null;
}
