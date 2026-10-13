"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X, ArrowUpRight } from "lucide-react";
import book from "@/content/book.json";
import { searchEntries } from "@/lib/search";
import { kindLabels, type SearchEntry, type EntryMeta } from "@/lib/types";
let indexPromise: Promise<SearchEntry[]> | undefined;
function loadIndex() {
  indexPromise ??= fetch(
    `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/search-index.json`,
  )
    .then((r) => {
      if (!r.ok) throw new Error("Unable to load search index");
      return r.json() as Promise<SearchEntry[]>;
    })
    .catch((e) => {
      indexPromise = undefined;
      throw e;
    });
  return indexPromise;
}
export default function SearchDialog({
  entries,
  hideTrigger = false,
}: {
  entries: EntryMeta[];
  hideTrigger?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchEntry[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const results = searchEntries(index, query);
  function open() {
    dialog.current?.showModal();
    input.current?.focus();
    if (index.length) return;
    setLoading(true);
    setError(false);
    loadIndex()
      .then(setIndex)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        open();
      }
    }
    window.addEventListener("keydown", key);
    window.addEventListener("toeic:search", open);
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("toeic:search", open);
    };
    // Index is cached across opens; the dialog's input remains focused.
  });
  const suggestions = entries.filter((e) =>
    book.searchSuggestions.includes(e.slug),
  );
  return (
    <>
      {!hideTrigger && (
        <button className="search-trigger" onClick={open}>
          <Search size={16} />
          <span>搜索这本手册</span>
          <kbd>⌘ K</kbd>
        </button>
      )}
      <dialog
        ref={dialog}
        className="search-dialog"
        aria-label="搜索教材"
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current.close();
        }}
      >
        <div className="search-input">
          <Search size={20} />
          <input
            ref={input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索单词、词缀、语法或中文含义…"
            aria-label="搜索教材"
          />
          <button aria-label="关闭搜索" onClick={() => dialog.current?.close()}>
            <X size={20} />
          </button>
        </div>
        <div className="search-results" aria-live="polite">
          {loading ? (
            <p className="empty">正在加载全文索引…</p>
          ) : error ? (
            <div className="empty">
              搜索索引加载失败。<button onClick={open}>重新加载</button>
            </div>
          ) : query.trim() && !results.length ? (
            <p className="empty">
              没有找到“{query}”。试试中文含义、词根或搭配。
            </p>
          ) : (
            <>
              <div className="search-label">
                {query.trim()
                  ? `找到 ${results.length} 个条目 · 显示前 30 个`
                  : "常用查阅"}
              </div>
              {(query.trim() ? results.slice(0, 30) : suggestions).map(
                (entry) => {
                  const related = [
                    ...new Set([...(entry.family ?? []), ...entry.related]),
                  ]
                    .map((slug) => entries.find((e) => e.slug === slug))
                    .filter(Boolean)
                    .slice(0, 5);
                  return (
                    <div className="search-result" key={entry.slug}>
                      <Link
                        href={`/read/${entry.slug}/`}
                        onClick={() => dialog.current?.close()}
                      >
                        <span className="result-title">
                          {entry.title}
                          <span className="result-type">
                            {kindLabels[entry.kind]}
                          </span>
                        </span>
                        <p>{entry.summary}</p>
                        <ArrowUpRight size={16} />
                      </Link>
                      {related.length > 0 && (
                        <div className="result-related">
                          <span>关联</span>
                          {related.map((item) => (
                            <Link
                              key={item!.slug}
                              href={`/read/${item!.slug}/`}
                              onClick={() => dialog.current?.close()}
                            >
                              {item!.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                },
              )}
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
