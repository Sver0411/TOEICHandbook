import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import GithubSlugger from "github-slugger";
import {
  kindLabels,
  type Entry,
  type EntryMeta,
  type Heading,
  type Kind,
} from "./types";

let cached: Entry[] | undefined;
export function getEntries(): Entry[] {
  if (cached) return cached;
  const root = path.join(process.cwd(), "content");
  cached = Object.keys(kindLabels)
    .flatMap((kind) => {
      const dir = path.join(root, kind);
      if (!fs.existsSync(dir)) return [];
      return fs
        .readdirSync(dir)
        .filter((file) => file.endsWith(".md"))
        .map((file) => {
          const source = fs.readFileSync(path.join(dir, file), "utf8");
          const front = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
          if (!front) throw new Error(`Missing frontmatter: ${kind}/${file}`);
          const data = parse(front[1]);
          if (!data || typeof data !== "object" || Array.isArray(data))
            throw new Error(`Invalid frontmatter: ${file}`);
          const content = source.slice(front[0].length);
          const slug = file.slice(0, -3);
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
            throw new Error(`Invalid slug: ${file}`);
          if (
            data.kind !== kind ||
            typeof data.title !== "string" ||
            typeof data.summary !== "string" ||
            !Number.isInteger(data.chapter)
          )
            throw new Error(`Invalid frontmatter: ${kind}/${file}`);
          for (const key of ["tags", "related", "family"]) {
            if (
              data[key] !== undefined &&
              (!Array.isArray(data[key]) ||
                !data[key].every((x: unknown) => typeof x === "string"))
            )
              throw new Error(`Invalid ${key}: ${file}`);
          }
          return {
            ...data,
            slug,
            kind: kind as Kind,
            tags: data.tags ?? [],
            related: data.related ?? [],
            body: content.trim(),
            readingMinutes: Math.max(1, Math.ceil(content.length / 700)),
          } as Entry;
        });
    })
    .sort(
      (a, b) =>
        a.chapter - b.chapter ||
        (a.kind === "chapters" ? -1 : b.kind === "chapters" ? 1 : 0) ||
        (a.order ?? 0) - (b.order ?? 0) ||
        a.title.localeCompare(b.title, "en"),
    );
  const unique = new Set(cached.map((e) => e.slug));
  if (unique.size !== cached.length)
    throw new Error("Content slugs must be globally unique.");
  return cached;
}
export function getMeta(entry: Entry): EntryMeta {
  const { body: _body, ...meta } = entry;
  return meta;
}
export function getEntry(slug: string) {
  return getEntries().find((e) => e.slug === slug);
}
export function getChapters() {
  return getEntries().filter((e) => e.kind === "chapters");
}
export function getRelated(entry: Entry) {
  const all = getEntries();
  const explicit = [...entry.related, ...(entry.family ?? [])];
  return all.filter(
    (other) =>
      other.slug !== entry.slug &&
      (explicit.includes(other.slug) ||
        other.related.includes(entry.slug) ||
        other.family?.includes(entry.slug)),
  );
}
export function getHeadings(body: string): Heading[] {
  const slugger = new GithubSlugger();
  // Ignore fenced code, so Markdown headings in examples never enter the outline.
  return body
    .replace(/```[^]*?```/g, "")
    .split("\n")
    .flatMap((line) => {
      const match = /^(#{2,3})\s+(.+)$/.exec(line);
      if (!match) return [];
      const text = match[2].replace(/[*`]/g, "");
      return [{ id: slugger.slug(text), text, level: match[1].length }];
    });
}
