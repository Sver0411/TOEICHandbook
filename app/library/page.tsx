import { getEntries, getMeta } from "@/lib/content";
import LibraryBrowser from "@/components/LibraryBrowser";
export const metadata = { title: "知识索引与书签" };
export default function LibraryPage() {
  return (
    <main id="main-content" className="library-page">
      <h1>知识索引</h1>
      <LibraryBrowser
        entries={getEntries()
          .filter((e) => e.kind !== "chapters")
          .map(getMeta)}
      />
    </main>
  );
}
