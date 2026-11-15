/**
 * Fetch every page of a limit/offset endpoint. The backend returns bare arrays
 * (no total), so a short page means "last page". Capped so a runaway endpoint
 * can't loop forever; `truncated` tells the caller when the cap was hit.
 */
export async function fetchAll<T>(
  fetchPage: (limit: number, offset: number) => Promise<T[]>,
  pageSize = 200,
  maxItems = 5000,
): Promise<{ items: T[]; truncated: boolean }> {
  const items: T[] = [];
  for (let offset = 0; offset < maxItems; offset += pageSize) {
    const page = await fetchPage(pageSize, offset);
    items.push(...page);
    if (page.length < pageSize) return { items, truncated: false };
  }
  return { items, truncated: true };
}
