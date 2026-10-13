import Link from "next/link";
import { kindLabels, type EntryMeta } from "@/lib/types";
export default function EntryList({ entries }: { entries: EntryMeta[] }) {
  return (
    <div className="entry-list">
      {entries.map((e) => (
        <Link className="entry-row" href={`/read/${e.slug}/`} key={e.slug}>
          <div>
            <h3>{e.title}</h3>
            <p>{e.summary}</p>
          </div>
          <span className="entry-kind">{kindLabels[e.kind]}</span>
          <span className="row-arrow">›</span>
        </Link>
      ))}
    </div>
  );
}
