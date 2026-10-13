"use client";
import Link from "next/link";
import book from "@/content/book.json";
import { useEffect, useState } from "react";
import { readSetting } from "@/lib/storage";
export default function ResumeReading() {
  const [last, setLast] = useState<{ slug: string; title: string } | null>(
    null,
  );
  useEffect(() => setLast(readSetting("last", null)), []);
  return (
    <Link
      className="primary-button"
      href={`/read/${last?.slug || book.firstChapter}/`}
    >
      {last ? `继续阅读：${last.title}` : "从第一章开始"}
      <span>→</span>
    </Link>
  );
}
