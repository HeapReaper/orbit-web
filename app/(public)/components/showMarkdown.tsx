import { marked } from "marked";

interface ShowMarkdownProps {
  content: string | Promise<string>;
  classes?: string;
}

export default async function ShowMarkdown({
  content,
  classes,
}: ShowMarkdownProps) {
  const resolvedContent = await content;
  const html = await marked(resolvedContent || "", { gfm: true });

  return (
    <div
      className={`text-gray-300 prose prose-invert max-w-3xl mx-auto ${classes || ""}`}
    >
      <div
        className="pre:rounded pre:bg-gray-800 pre:p-4 pre:text-gray-200 pre:overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: html as string }}
      />
    </div>
  );
}
