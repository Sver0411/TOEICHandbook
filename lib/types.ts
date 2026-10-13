export const kindLabels = {
  chapters: "章节",
  vocabulary: "词汇",
  grammar: "语法",
  suffix: "后缀",
  prefix: "前缀",
  patterns: "动词搭配",
  expressions: "高频表达",
  reference: "阅读笔记",
} as const;
export type Kind = keyof typeof kindLabels;
export interface EntryMeta {
  slug: string;
  title: string;
  kind: Kind;
  chapter: number;
  summary: string;
  tags: string[];
  related: string[];
  family?: string[];
  phonetic?: string;
  pos?: string;
  order?: number;
  rule?: string;
  readingMinutes: number;
}
export interface Entry extends EntryMeta {
  body: string;
}
export interface SearchEntry extends EntryMeta {
  text: string;
}
export interface Heading {
  id: string;
  text: string;
  level: number;
}
