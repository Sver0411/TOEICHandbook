import Link from "next/link";
import { getEntries, getChapters } from "@/lib/content";
import book from "@/content/book.json";
import ResumeReading from "@/components/ResumeReading";
export default function Home() {
  const entries = getEntries();
  const chapters = getChapters();
  return (
    <main id="main-content" className="home-page">
      <header className="home-header">
        <h1>{book.title}</h1>
        <div className="home-actions">
          <ResumeReading />
          <Link className="secondary-button" href="/library/">
            查阅全部知识
          </Link>
        </div>
      </header>
      <section className="contents-section">
        <h2>目录</h2>
        <div className="contents-list">
          {chapters.map((ch) => {
            const count = entries.filter(
              (e) => e.chapter === ch.chapter && e.kind !== "chapters",
            ).length;
            return (
              <Link href={`/read/${ch.slug}/`} key={ch.slug}>
                <span className="contents-number">
                  {String(ch.chapter).padStart(2, "0")}
                </span>
                <div>
                  <h3>{ch.title}</h3>
                  <p>{ch.summary}</p>
                </div>
                {count > 0 && (
                  <span className="chapter-items">{count} 个条目</span>
                )}
                <span className="row-arrow">›</span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
