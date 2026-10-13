import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import Link from "next/link";
const schema = {
  ...defaultSchema,
  tagNames: [...defaultSchema.tagNames!, "mark", "details", "summary"],
  attributes: { ...defaultSchema.attributes, details: ["open"] },
};
export default function Markdown({ body }: { body: string }) {
  const highlighted = body
    .split(/(```[^]*?```|`[^`\n]*`)/g)
    .map((part, i) =>
      i % 2 ? part : part.replace(/==([^=\n]+)==/g, "<mark>$1</mark>"),
    )
    .join("");
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, schema], rehypeSlug]}
        components={{
          a: ({ href, children }) =>
            href?.startsWith("/read/") ? (
              <Link href={href}>{children}</Link>
            ) : (
              <a
                href={href}
                {...(href?.startsWith("http")
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
              >
                {children}
              </a>
            ),
          table: ({ children }) => (
            <div className="table-scroll">
              <table>{children}</table>
            </div>
          ),
          img: ({ src, alt }) =>
            typeof src === "string" ? (
              <img
                src={
                  src.startsWith("/")
                    ? `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${src}`
                    : src
                }
                alt={alt || ""}
                loading="lazy"
              />
            ) : null,
        }}
      >
        {highlighted}
      </ReactMarkdown>
    </div>
  );
}
