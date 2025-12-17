import Image from "next/image";
import React from "react";
import ReactMarkdown from "react-markdown";

export interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface EmbedData {
  color?: string;
  title?: string;
  titleUrl?: string;
  description?: string;

  author?: {
    name?: string;
    icon?: string;
  };

  thumbnail?: string;
  image?: string;

  footer?: {
    text?: string;
    icon?: string;
  };

  fields?: EmbedField[];
}

interface EmbedPreviewProps {
  embed: EmbedData;
  replace?: Array<[string, string]>;
}

function replaceInEmbed(obj: any, replace?: Array<[string, string]>): any {
  if (!replace) return obj;

  if (typeof obj === "string") {
    let str = obj;
    for (const [key, value] of replace) {
      str = str.replaceAll(key, value);
    }
    return str;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => replaceInEmbed(item, replace));
  }

  if (typeof obj === "object" && obj !== null) {
    const newObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        newObj[key] = replaceInEmbed(obj[key], replace);
      }
    }
    return newObj;
  }

  return obj;
}

export default function EmbedPreview({ embed, replace }: EmbedPreviewProps) {
  const renderedEmbed = replaceInEmbed(embed, replace);

  return (
    <div className="bg-[#2b2d31] p-5 rounded-lg border border-[#202225] max-w-lg mt-3 mb-3">
      <div className="flex items-start gap-3">
        {/* Bot avatar */}
        <Image
          src="/logo-medium-.png"
          alt="Bot avatar"
          width={40}
          height={40}
          className="rounded-full"
        />

        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-white">Orbit</span>
            <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold">APP</span>
            <span className="text-xs text-gray-400">
              {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          {/* Embed */}
          <div className="mt-1 break-words">
            <div
              className="flex-1 bg-[#393A41] rounded border-l-4 p-3 mt-2"
              style={{ borderColor: renderedEmbed.color || "#5865F2" }}
            >
              <div className={`flex ${renderedEmbed.thumbnail ? 'gap-4' : ''}`}>
                {/* Left column: Text content */}
                <div className="flex-1">
                  {/* Author */}
                  {renderedEmbed.author?.name && (
                    <div className="flex items-center gap-2 mb-1">
                      {renderedEmbed.author.icon && (
                        <img
                          src={renderedEmbed.author.icon}
                          alt="Author icon"
                          className="w-7 h-7 object-cover rounded-full border border-gray-600"
                        />
                      )}
                      <span className="text-white font-semibold text-sm">{renderedEmbed.author.name}</span>
                    </div>
                  )}

                  {/* Title */}
                  {renderedEmbed.title && (
                    renderedEmbed.titleUrl ? (
                      <a
                        href={renderedEmbed.titleUrl}
                        className="font-bold text-sm text-[#7BB0F5] block mb-1 no-underline hover:underline underline-offset-2"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ReactMarkdown>{renderedEmbed.title}</ReactMarkdown>
                      </a>
                    ) : (
                      <h5 className="font-bold text-sm text-white mb-1">
                        <ReactMarkdown>{renderedEmbed.title}</ReactMarkdown>
                      </h5>
                    )
                  )}

                  {/* Description */}
                  {renderedEmbed.description && (
                    <p className="text-gray-300 text-sm whitespace-pre-line mb-1">
                      <ReactMarkdown>{renderedEmbed.description}</ReactMarkdown>
                    </p>
                  )}

                  {/* Fields */}
                  {(renderedEmbed.fields?.length ?? 0) > 0 && (
                    <div className="mt-1 grid grid-cols-1 gap-1">
                      {(renderedEmbed.fields || []).map((f: { inline: any; name: string | null | undefined; value: string | null | undefined; }, i: React.Key | null | undefined) => (
                        <div key={i} className={f.inline ? "inline-block w-[45%] mr-2" : "block"}>
                          <div className="text-white font-semibold text-xs">
                            <ReactMarkdown>{f.name}</ReactMarkdown>
                          </div>
                          <div className="text-gray-300 text-xs whitespace-pre-line">
                            <ReactMarkdown>{f.value}</ReactMarkdown>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  {(renderedEmbed.footer?.text || renderedEmbed.footer?.icon) && (
                    <div className="flex items-center gap-1 mt-2 text-gray-400 text-xs">
                      {renderedEmbed.footer.icon && (
                        <img src={renderedEmbed.footer.icon} className="w-3 h-3 rounded" alt="" />
                      )}
                      <ReactMarkdown>{renderedEmbed.footer?.text || ""}</ReactMarkdown>
                    </div>
                  )}
                </div>

                {renderedEmbed.thumbnail && (
                  <div className="flex-shrink-0">
                    <img
                      src={renderedEmbed.thumbnail}
                      alt="Thumbnail"
                      className="w-20 h-20 object-cover rounded"
                    />
                  </div>
                )}
              </div>

              {renderedEmbed.image && (
                <img
                  src={renderedEmbed.image}
                  alt="Embed image"
                  className="rounded mt-2 w-full"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}