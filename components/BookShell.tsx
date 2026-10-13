"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import SearchDialog from "./SearchDialog";
import { ReadingToolbar } from "./ReadingTools";
import type { EntryMeta } from "@/lib/types";
export default function BookShell({
  entries,
  children,
}: {
  entries: EntryMeta[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const chapters = entries.filter((e) => e.kind === "chapters");
  const current = entries.find((e) =>
    pathname.replace(/\/$/, "").endsWith(`/read/${e.slug}`),
  );
  const currentChapter = chapters.find((e) => e.chapter === current?.chapter);
  const subEntries = current
    ? [
        ...(current.kind !== "chapters" ? [current] : []),
        ...entries.filter(
          (e) =>
            e.chapter === current.chapter &&
            e.kind !== "chapters" &&
            e.slug !== current.slug,
        ),
      ].slice(0, 5)
    : [];
  return (
    <div className="book-shell">
      <a href="#main-content" className="skip-link">
        跳到正文
      </a>
      <SearchDialog entries={entries} hideTrigger />
      <aside className="sidebar">
        <Link href="/" className="brand">
          英语手册
        </Link>
        <button
          className="search-trigger"
          onClick={() => window.dispatchEvent(new Event("toeic:search"))}
        >
          <Search size={18} />
          <span>搜索教材</span>
          <kbd>⌘ K</kbd>
        </button>
        <nav className="main-nav" aria-label="教材导航">
          <Link href="/" className={pathname === "/" ? "selected" : ""}>
            目录
          </Link>
          <Link
            href="/library/"
            className={pathname.includes("/library") ? "selected" : ""}
          >
            知识索引与书签
          </Link>
        </nav>
        <nav aria-label="章节目录" className="chapter-nav">
          {chapters.map((ch) => (
            <div key={ch.slug}>
              <Link
                className={`chapter-link ${current?.chapter === ch.chapter ? "active" : ""}`}
                href={`/read/${ch.slug}/`}
              >
                <span className="chapter-num">{ch.chapter}</span>
                {ch.title}
              </Link>
              {current?.chapter === ch.chapter && (
                <div className="chapter-subnav">
                  {subEntries.map((e) => (
                    <Link
                      href={`/read/${e.slug}/`}
                      className={current.slug === e.slug ? "current" : ""}
                      key={e.slug}
                    >
                      {e.title}
                    </Link>
                  ))}
                  {entries.filter(
                    (e) => e.chapter === ch.chapter && e.kind !== "chapters",
                  ).length > 5 && (
                    <Link href={`/read/${ch.slug}/#chapter-knowledge`}>
                      本章全部条目
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>
        <Link
          className="repository-link"
          href="https://github.com/Sver0411/TOEICHandbook"
          target="_blank"
          rel="noreferrer"
        >
          在 GitHub 编辑教材 ↗
        </Link>
      </aside>
      <div className="book-main">
        <header className="topbar">
          <div className="breadcrumbs">
            {currentChapter ? (
              <>
                <Link href="/">目录</Link>
                <span>/</span>
                <Link href={`/read/${currentChapter.slug}/`}>
                  {currentChapter.title}
                </Link>
                {current?.kind !== "chapters" && (
                  <>
                    <span>/</span>
                    <span>{current?.title}</span>
                  </>
                )}
              </>
            ) : pathname.includes("/library") ? (
              <Link href="/">返回目录</Link>
            ) : null}
          </div>
          <ReadingToolbar />
        </header>
        {children}
      </div>
    </div>
  );
}
