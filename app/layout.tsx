import type { Metadata } from "next";
import BookShell from "@/components/BookShell";
import { getEntries, getMeta } from "@/lib/content";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "My TOEIC English Handbook",
    template: "%s · English Handbook",
  },
  description:
    "一本持续生长的个人英语教材。阅读词汇、构词法、语法与商务场景，建立知识之间的联系。",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <BookShell entries={getEntries().map(getMeta)}>{children}</BookShell>
      </body>
    </html>
  );
}
