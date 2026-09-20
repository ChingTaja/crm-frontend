export function moveField(order: number[], source: number, target: number): number[] {
  const from = order.indexOf(source)
  const to = order.indexOf(target)
  if (from < 0 || to < 0 || from === to) return order
  const next = [...order]
  next.splice(from, 1)
  next.splice(to, 0, source)
  return next
}
