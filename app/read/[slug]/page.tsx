import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getEntries,
  getEntry,
  getChapters,
  getRelated,
  getHeadings,
  getMeta,
} from "@/lib/content";
import Markdown from "@/components/Markdown";
import EntryList from "@/components/EntryList";
import { BookmarkButton } from "@/components/ReadingTools";
export function generateStaticParams() {
  return getEntries().map((e) => ({ slug: e.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const e = getEntry((await params).slug);
  return { title: e?.title, description: e?.summary };
}
export default async function ReadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const entry = getEntry((await params).slug);
  if (!entry) notFound();
  const chapters = getChapters();
  const related = getRelated(entry);
  const affixes = related.filter((e) => ["suffix", "prefix"].includes(e.kind));
  const others = related.filter(
    (e) =>
      !["suffix", "prefix"].includes(e.kind) && !entry.family?.includes(e.slug),
  );
  const headings = getHeadings(entry.body);
  const chapterEntries = getEntries().filter(
    (e) => e.chapter === entry.chapter && e.kind !== "chapters",
  );
  const sequence = entry.kind === "chapters" ? chapters : chapterEntries;
  const idx = sequence.findIndex((e) => e.slug === entry.slug);
  const prev = sequence[idx - 1];
  const next = sequence[idx + 1];
  return (
    <main id="main-content" className="reading-layout">
      <article className="reading-article">
        <header className="article-header">
          <div className="article-title-row">
            <h1>{entry.title}</h1>
            <BookmarkButton slug={entry.slug} title={entry.title} />
          </div>
          {entry.phonetic && (
            <div className="phonetic">
              {entry.phonetic}
              <span>{entry.pos}</span>
            </div>
          )}
          <p className="article-summary">{entry.summary}</p>
        </header>
        <Markdown body={entry.body} />
        {entry.kind === "chapters" && chapterEntries.length > 0 && (
          <section className="chapter-entries" id="chapter-knowledge">
            <h2>本章知识条目</h2>
            <EntryList entries={chapterEntries.map(getMeta)} />
          </section>
        )}
        <div className="article-navigation">
          {prev ? (
            <Link href={`/read/${prev.slug}/`}>
              <span>← 上一篇</span>
              {prev.title}
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link href={`/read/${next.slug}/`}>
              <span>下一篇 →</span>
              {next.title}
            </Link>
          ) : (
            <Link href="/">
              <span>返回目录 →</span>手册首页
            </Link>
          )}
        </div>
        <div className="source-note">
          <a
            href={`https://github.com/Sver0411/TOEICHandbook/edit/main/content/${entry.kind}/${entry.slug}.md`}
            target="_blank"
            rel="noreferrer"
          >
            编辑此页 ↗
          </a>
        </div>
      </article>
      <aside className="reading-aside">
        <div className="aside-sticky">
          <nav className="page-outline" aria-label="本页目录">
            <h2>本页目录</h2>
            {headings.map((h) => (
              <a
                href={`#${h.id}`}
                key={h.id}
                style={{ paddingLeft: h.level === 3 ? 12 : 0 }}
              >
                {h.text}
              </a>
            ))}
            {entry.kind === "chapters" && chapterEntries.length > 0 && (
              <a href="#chapter-knowledge">本章知识条目</a>
            )}
          </nav>
          {(related.length > 0 || !!entry.family?.length) && (
            <section className="connections">
              {entry.family && entry.family.length > 0 && (
                <>
                  <h2>词形与词族</h2>
                  <div className="related-tags">
                    {entry.family.map((w) =>
                      getEntry(w) ? (
                        <Link key={w} href={`/read/${w}/`}>
                          {w}
                        </Link>
                      ) : (
                        <span key={w}>{w}</span>
                      ),
                    )}
                  </div>
                </>
              )}
              {affixes.length > 0 && (
                <>
                  <h2>相关词缀</h2>
                  {affixes.map((e) => (
                    <Link
                      className="related-entry"
                      key={e.slug}
                      href={`/read/${e.slug}/`}
                    >
                      {e.title}
                      <span>{e.summary}</span>
                    </Link>
                  ))}
                </>
              )}
              {others.length > 0 && (
                <>
                  <h2>相关知识</h2>
                  {others.slice(0, 7).map((e) => (
                    <Link
                      className="related-entry"
                      key={e.slug}
                      href={`/read/${e.slug}/`}
                    >
                      {e.title}
                      <span>{e.summary}</span>
                    </Link>
                  ))}
                </>
              )}
            </section>
          )}
        </div>
      </aside>
    </main>
  );
}
