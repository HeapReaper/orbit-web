import { marked } from "marked";

interface ShowMarkdownProps {
  content: string;
  classes?: string;
}

export default function ShowMarkdown({ content, classes }: ShowMarkdownProps) {
  const html = marked(content || "", { gfm: true });

  return (
    <div
      className={`text-gray-300 prose
    prose-sm prose-h1:text-white prose-h2:text-white prose-h3:text-white
    prose-strong:text-white prose-ol:text-white prose-a:text-white
    max-w-3xl mx-auto
    ${classes || ""}
  `}
    >
      <div
        className="
      code:inline-block code:bg-gray-800 code:text-gray-200 code:px-1.5 code:py-0.5 code:rounded code:font-mono
      pre:rounded pre:bg-gray-800 pre:p-4 pre:text-gray-200 pre:overflow-x-auto
    "
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
