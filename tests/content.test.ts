import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getEntries,
  getEntry,
  getRelated,
  getHeadings,
  getMeta,
} from "../lib/content";
import { searchEntries } from "../lib/search";
const index = getEntries().map((e) => ({ ...getMeta(e), text: e.body }));
test("employment ranks first and connects to its family and suffix", () => {
  assert.equal(searchEntries(index, "employment")[0].slug, "employment");
  const related = getRelated(getEntry("employment")!).map((e) => e.slug);
  for (const slug of ["employ", "employee", "employer", "ment"])
    assert(related.includes(slug));
});
test("English case, affix punctuation and Chinese queries are supported", () => {
  assert.equal(searchEntries(index, "OPERATE")[0].slug, "operate");
  assert.equal(searchEntries(index, "-ment")[0].slug, "ment");
  assert(
    searchEntries(index, "现在完成").some((e) => e.slug === "present-perfect"),
  );
  assert(searchEntries(index, "不可数").some((e) => e.slug === "equipment"));
  assert.equal(searchEntries(index, "unmatched-needle-zzz").length, 0);
  assert.equal(searchEntries(index, "   ").length, 0);
});
test("outline ignores code examples and creates distinct duplicate anchors", () => {
  const headings = getHeadings(
    "## 核心结构\n```md\n## Not a heading\n```\n## 核心结构",
  );
  assert.deepEqual(
    headings.map((h) => h.id),
    ["核心结构", "核心结构-1"],
  );
});
