export function FieldError({ id, error }: { id: string; error: string }) {
  return error ? (
    <p id={id} role="alert" className="mt-1 min-w-0 text-xs text-destructive [overflow-wrap:anywhere]">
      {error}
    </p>
  ) : null;
}
