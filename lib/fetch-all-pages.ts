export async function fetchAllPages<T>(
  url: string,
  errorMessage: string,
): Promise<T[]> {
  const all: T[] = [];

  for (let page = 1; ; page++) {
    const res = await fetch(
      `${url}?page=${page}&pageSize=100&sortField=name&sortOrder=asc`,
    );
    if (!res.ok) throw new Error(errorMessage);

    const { items, totalItems } = (await res.json()) as {
      items: T[];
      totalItems: number;
    };
    all.push(...items);
    if (items.length === 0 || all.length >= totalItems) break;
  }

  return all;
}
