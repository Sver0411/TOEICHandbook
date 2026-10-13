import fs from "node:fs";
import assert from "node:assert/strict";
import { getEntries, getChapters, getMeta } from "../lib/content";
const entries = getEntries();
const slugs = new Set(entries.map((e) => e.slug));
const chapterEntries = getChapters();
const chapters = new Set(chapterEntries.map((e) => e.chapter));
assert(
  chapters.size === chapterEntries.length,
  "Chapter numbers must be unique.",
);
for (const entry of entries) {
  assert(
    entry.summary.length > 0 && entry.body.length > 100,
    `Empty content: ${entry.slug}`,
  );
  assert(chapters.has(entry.chapter), `Missing chapter: ${entry.slug}`);
  for (const slug of entry.related)
    assert(slugs.has(slug), `Broken relation: ${entry.slug} → ${slug}`);
  for (const match of entry.body.matchAll(
    /\]\(\/read\/([a-z0-9-]+)\/?(?:#[^)]*)?\)/g,
  ))
    assert(slugs.has(match[1]), `Broken link in ${entry.slug}: ${match[1]}`);
  if (entry.kind === "grammar")
    for (const heading of [
      "结构",
      "使用场景",
      "时间关键词",
      "常见错误",
      "TOEIC 例句",
    ])
      assert(entry.body.includes(heading), `Missing ${heading}: ${entry.slug}`);
  if (entry.kind === "vocabulary")
    for (const heading of ["核心含义", "例句", "词性变化", "TOEIC 场景"])
      assert(entry.body.includes(heading), `Missing ${heading}: ${entry.slug}`);
}
assert(entries.filter((e) => e.kind === "vocabulary").length >= 50);
assert(
  entries.filter((e) => ["suffix", "prefix"].includes(e.kind)).length >= 20,
);
assert(entries.filter((e) => e.kind === "grammar").length >= 10);
fs.mkdirSync("public", { recursive: true });
fs.writeFileSync(
  "public/search-index.json",
  JSON.stringify(
    entries.map((e) => ({
      ...getMeta(e),
      text: e.body.replace(/<[^>]*>/g, " ").replace(/[>#*`]/g, " "),
    })),
  ),
);
const counts = Object.fromEntries(
  [...new Set(entries.map((e) => e.kind))].map((kind) => [
    kind,
    entries.filter((e) => e.kind === kind).length,
  ]),
);
console.log("Content validated:", counts, `Total: ${entries.length}`);
