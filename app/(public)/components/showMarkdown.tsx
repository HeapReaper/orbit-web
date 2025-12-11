import { marked } from "marked";

interface ShowMarkdownProps {
  content: string | Promise<string>;
  classes?: string;
}

// This is a server component
export default async function ShowMarkdown({ content, classes }: ShowMarkdownProps) {
  const resolvedContent = await content; // await if it's a promise
  const html = await marked(resolvedContent || "", { gfm: true }); // ensure string

  return (
    <div className={`text-gray-300 prose max-w-3xl mx-auto ${classes || ""}`}>
      <div
        className="pre:rounded pre:bg-gray-800 pre:p-4 pre:text-gray-200 pre:overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: html as string }}
      />
    </div>
  );
}
