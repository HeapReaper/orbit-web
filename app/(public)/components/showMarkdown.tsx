import { marked } from "marked";

interface ShowMarkdownProps {
  content: string;
  classes: string;
}

export default function ShowMarkdown({ content, classes }: ShowMarkdownProps) {
  const html = marked(content || "");

  return (
    <div
      className={`text-gray-300 prose
        prose-sm prose-h1:text-white prose-h2:text-white prose-h3:text-white
        prose-strong:text-white prose-ol:text-white prose-a:text-white prose-code:text-white
         ${classes}
      `}
    >
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}