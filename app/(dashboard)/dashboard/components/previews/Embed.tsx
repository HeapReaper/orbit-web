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
}

export default function EmbedPreview({ embed }: EmbedPreviewProps) {
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
              style={{ borderColor: embed.color || "#5865F2" }}
            >
              <div className={`flex ${embed.thumbnail ? 'gap-4' : ''}`}>
                {/* Left column: Text content */}
                <div className="flex-1">
                  {/* Author */}
                  {embed.author?.name && (
                    <div className="flex items-center gap-2 mb-1">
                      {embed.author.icon && (
                        <img
                          src={embed.author.icon}
                          alt="Author icon"
                          className="w-6 h-6 object-cover rounded-full border border-gray-600"
                        />
                      )}
                      <span className="text-white font-semibold text-sm">{embed.author.name}</span>
                    </div>
                  )}

                  {/* Title */}
                  {embed.title && (
                    embed.titleUrl ? (
                      <a
                        href={embed.titleUrl}
                        className="font-bold text-sm text-[#7BB0F5] block mb-1 no-underline hover:underline underline-offset-2"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ReactMarkdown>{embed.title}</ReactMarkdown>
                      </a>
                    ) : (
                      <h5 className="font-bold text-sm text-white mb-1">
                        <ReactMarkdown>{embed.title}</ReactMarkdown>
                      </h5>
                    )
                  )}

                  {/* Description */}
                  {embed.description && (
                    <p className="text-gray-300 text-sm whitespace-pre-line mb-1">
                      <ReactMarkdown>{embed.description}</ReactMarkdown>
                    </p>
                  )}

                  {/* Fields */}
                  {(embed.fields?.length ?? 0) > 0 && (
                    <div className="mt-1 grid grid-cols-1 gap-1">
                      {(embed.fields || []).map((f, i) => (
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
                  {(embed.footer?.text || embed.footer?.icon) && (
                    <div className="flex items-center gap-1 mt-2 text-gray-400 text-xs">
                      {embed.footer.icon && (
                        <img src={embed.footer.icon} className="w-3 h-3 rounded" alt="" />
                      )}
                      <ReactMarkdown>{embed.footer?.text || ""}</ReactMarkdown>
                    </div>
                  )}
                </div>

                {embed.thumbnail && (
                  <div className="flex-shrink-0">
                    <img
                      src={embed.thumbnail}
                      alt="Thumbnail"
                      className="w-20 h-20 object-cover rounded"
                    />
                  </div>
                )}
              </div>

              {embed.image && (
                <img
                  src={embed.image}
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