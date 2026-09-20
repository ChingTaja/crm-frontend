/** Keep the first/last pages visible around a bounded page window. */
export function getPaginationPages(page: number, pageCount: number): number[] {
  let start = 1
  let end = pageCount

  if (pageCount > 10) {
    if (page <= 6) {
      end = 10
    } else if (page >= pageCount - 5) {
      start = pageCount - 9
    } else {
      start = page - 4
      end = page + 4
    }
  }

  const window = Array.from({ length: end - start + 1 }, (_, index) => start + index)
  return [...new Set([1, ...window, pageCount])]
}
