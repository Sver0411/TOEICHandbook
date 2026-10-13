"use client";
import { useEffect, useState } from "react";
import { Bookmark, Check, Printer } from "lucide-react";
import { readSetting, writeSetting } from "@/lib/storage";
export function ReadingToolbar() {
  const [size, setSize] = useState(18);
  useEffect(() => {
    const s = readSetting("font", 18);
    setSize([16, 18, 20, 22].includes(s) ? s : 18);
    document.documentElement.removeAttribute("data-theme");
  }, []);
  useEffect(() => {
    document.documentElement.style.setProperty("--reading-size", `${size}px`);
  }, [size]);
  function resize(delta: number) {
    const next = Math.min(22, Math.max(16, size + delta));
    setSize(next);
    writeSetting("font", next);
  }
  return (
    <div className="toolbar-actions">
      <button
        aria-label="缩小正文字号"
        onClick={() => resize(-2)}
        disabled={size === 16}
      >
        A−
      </button>
      <button
        aria-label="放大正文字号"
        onClick={() => resize(2)}
        disabled={size === 22}
      >
        A+
      </button>
      <span className="tool-divider" />
      <button onClick={() => window.print()} aria-label="打印当前页面">
        <Printer size={16} />
        打印
      </button>
    </div>
  );
}
export function BookmarkButton({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    setSaved(readSetting<string[]>("bookmarks", []).includes(slug));
    writeSetting("last", { slug, title });
  }, [slug, title]);
  return (
    <button
      className={`bookmark-button ${saved ? "saved" : ""}`}
      onClick={() => {
        const all = readSetting<string[]>("bookmarks", []);
        const next = saved
          ? all.filter((s) => s !== slug)
          : [...new Set([...all, slug])];
        writeSetting("bookmarks", next);
        setSaved(!saved);
        window.dispatchEvent(new Event("toeic:bookmarks"));
      }}
      aria-pressed={saved}
    >
      {saved ? <Check size={16} /> : <Bookmark size={16} />}{" "}
      {saved ? "已加入书签" : "加入书签"}
    </button>
  );
}
