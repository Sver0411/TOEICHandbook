"use client";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import EntryList from "./EntryList";
import type { EntryMeta } from "@/lib/types";
import { normalize } from "@/lib/search";
import { readSetting } from "@/lib/storage";
export default function LibraryBrowser({ entries }: { entries: EntryMeta[] }) {
  const [kind, setKind] = useState("all");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  useEffect(() => {
    const update = () => setSaved(readSetting<string[]>("bookmarks", []));
    update();
    window.addEventListener("toeic:bookmarks", update);
    return () => window.removeEventListener("toeic:bookmarks", update);
  }, []);
  const filtered = entries.filter(
    (e) =>
      (kind === "all" ||
        (kind === "saved" ? saved.includes(e.slug) : e.kind === kind)) &&
      normalize(`${e.title} ${e.summary} ${e.tags.join(" ")}`).includes(
        normalize(query),
      ),
  );
  return (
    <>
      <div className="library-search">
        <Search size={19} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="筛选知识条目"
          placeholder="查找词条或中文含义"
        />
      </div>
      <div className="filter-tabs" aria-label="知识分类">
        {[
          ["all", "全部"],
          ["vocabulary", "词汇"],
          ["suffix", "后缀"],
          ["prefix", "前缀"],
          ["grammar", "语法"],
          ["patterns", "搭配"],
          ["expressions", "表达"],
          ["reference", "笔记"],
          ["saved", "我的书签"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={kind === key ? "active" : ""}
            aria-pressed={kind === key}
            onClick={() => setKind(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="results-count">{filtered.length} 个条目</p>
      {filtered.length ? (
        <EntryList entries={filtered} />
      ) : (
        <div className="library-empty">
          {kind === "saved"
            ? "还没有书签。阅读时点击“加入书签”即可保存在当前浏览器。"
            : "没有匹配的条目。"}
        </div>
      )}
    </>
  );
}
