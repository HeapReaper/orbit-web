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
        <Image
          src="/logo-medium-.png"
          alt="Bot avatar"
          width={40}
          height={40}
          className="rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Orbit</span>
            <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold">APP</span>
            <span className="text-xs text-gray-400">
              {/* TODO: Make it use locale settings */}
              {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <div className="mt-1 prose-invert break-words">


            <div className="flex-1 bg-[#393A41] rounded border-l-4 p-4 mt-2" style={{ borderColor: embed.color || "#5865F2" }} >
              {/* Embed container */}
              <div className="">
                {/* Author */}
                {embed.author?.name && (
                  <div className="flex items-center mb-2">
                    {embed.author.icon && (
                      <img
                        src={embed.author.icon}
                        alt="Thumbnail preview"
                        className="mt-0 mb-0 me-1 w-7 h-7 object-cover rounded-full border border-gray-600 block"
                      />
                    )}
                    <span className="text-white font-semibold">{embed.author.name}</span>
                  </div>
                )}

                {/* Title */}
                {embed.title && (
                  embed.titleUrl ? (
                    <a
                      href={embed.titleUrl}
                      className="font-bold text-lg text-[#7BB0F5] no-underline hover:underline underline-offset-2"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ReactMarkdown>{embed.title}</ReactMarkdown>
                    </a>
                  ) : (
                    <h5 className="font-bold text-lg text-white">
                      <ReactMarkdown>{embed.title}</ReactMarkdown>
                    </h5>
                  )
                )}

                {/* Description */}
                {embed.description && (
                  <p className="text-gray-300 mt-2 whitespace-pre-line">
                    <ReactMarkdown>{embed.description}</ReactMarkdown>
                  </p>
                )}

                {/* Fields */}
                {embed.fields?.length > 0 && (
                  <div className="mt-3 grid grid-cols-1">
                    {embed.fields.map((f, i) => (
                      <div
                        key={i}
                        className={`p-1 ${f.inline ? "inline-block w-[45%]" : "block"}`}
                      >
                        <div className="text-white font-semibold text-sm">
                          {f.name}
                        </div>
                        <div className="text-gray-300 text-sm whitespace-pre-line">
                          <ReactMarkdown>{f.value}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Thumbnail */}
                {embed.thumbnail && (
                  <img
                    src={embed.thumbnail}
                    alt=""
                    className="absolute top-4 right-4 w-20 h-20 object-cover rounded"
                  />
                )}

                {/* Footer */}
                {(embed.footer?.text || embed.footer?.icon) && (
                  <div className="flex items-center gap-2 mt-4 text-gray-400 text-xs">
                    {embed.footer.icon && (
                      <img
                        src={embed.footer.icon}
                        className="w-4 h-4 rounded"
                        alt=""
                      />
                    )}
                    {embed.footer.text}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}