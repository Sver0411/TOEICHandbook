import type { SearchEntry } from "./types";
export function normalize(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}
export function searchEntries(entries: SearchEntry[], query: string) {
  const q = normalize(query);
  if (!q) return [];
  const tokens = q.split(/\s+/);
  return entries
    .map((entry) => {
      const title = normalize(entry.title);
      const meta = normalize(
        [entry.summary, ...entry.tags, ...(entry.family ?? [])].join(" "),
      );
      const text = normalize(entry.text);
      const searchable = `${title} ${meta} ${text}`;
      if (!tokens.every((t) => searchable.includes(t)))
        return { entry, score: 0 };
      const score =
        title === q
          ? 1000
          : title.startsWith(q)
            ? 500
            : title.includes(q)
              ? 300
              : meta.includes(q)
                ? 100
                : 20;
      return { entry, score };
    })
    .filter((r) => r.score > 0)
    .sort(
      (a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title),
    )
    .map((r) => r.entry);
}
