"use client";

import { useState } from "react";
import DeleteButton from "@/app/(dashboard)/dashboard/components/buttons/Delete";

export default function EmbedBuilder({ value, onChange }) {

  const update = (patch) => {
    onChange({ ...value, ...patch });
  };

  return (
    <div className="bg-[#1f2330] p-5 rounded-lg border border-gray-700 space-y-4">

      {/* Color */}
      <div>
        <label className="block text-gray-400">Color</label>
        <input
          type="color"
          value={value.color || "#5865F2"}
          onChange={(e) => update({ color: e.target.value })}

          className="w-full h-10 p-0 border border-gray-700 rounded cursor-pointer"
        />
      </div>

      {/* Title */}
      <div>
        <label className="text-white text-sm">Title</label>
        <input
          className="w-full mt-1 bg-[#0f1117] border border-gray-700 text-white p-2 rounded"
          value={value.title || ""}
          onChange={(e) => update({ title: e.target.value })}
        />
      </div>

      {/* Title URL */}
      <div>
        <label className="text-white text-sm">Title URL</label>
        <input
          className="w-full mt-1 bg-[#0f1117] border border-gray-700 text-white p-2 rounded"
          value={value.titleUrl || ""}
          onChange={(e) => update({ titleUrl: e.target.value })}
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-white text-sm">Description</label>
        <textarea
          rows={4}
          className="w-full mt-1 bg-[#0f1117] border border-gray-700 text-white p-2 rounded"
          value={value.description || ""}
          onChange={(e) => update({ description: e.target.value })}
        />
      </div>

      {/* Author */}
      <div className="border-t border-gray-700 pt-3">
        <h3 className="text-gray-300">Author</h3>

        <input
          placeholder="Author name"
          className="w-full mt-1 mb-2 bg-[#0f1117] border border-gray-700 text-white p-2 rounded"
          value={value.author?.name || ""}
          onChange={(e) =>
            update({ author: { ...value.author, name: e.target.value } })
          }
        />

        <input
          placeholder="Author icon URL"
          className="w-full bg-[#0f1117] border border-gray-700 text-white p-2 rounded"
          value={value.author?.icon || ""}
          onChange={(e) =>
            update({ author: { ...value.author, icon: e.target.value } })
          }
        />
      </div>

      {/* Thumbnail / Image */}
      <div className="border-t border-gray-700 pt-3">
        <h3 className="text-gray-300">Thumbnail / Image</h3>

        {/* URL input */}
        <input
          placeholder="Enter image URL"
          className="w-full mt-1 mb-2 bg-[#0f1117] border border-gray-700 text-white p-2 rounded"
          value={value.thumbnail || ""}
          onChange={(e) => update({ thumbnail: e.target.value })}
        />

        {/* File upload */}
        <input
          type="file"
          accept="image/*"
          className="w-full mt-1 mb-2 text-sm text-white"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
              update({ thumbnail: reader.result }); // base64
            };
            reader.readAsDataURL(file);
          }}
        />

        {/* Preview */}
        {value.thumbnail && (
          <div className="mt-2">
            <img
              src={value.thumbnail}
              alt="Thumbnail preview"
              className="w-24 h-24 object-cover rounded border border-gray-600 block"
            />
          </div>
        )}
      </div>

      {/* Fields */}
      <div className="border-t border-gray-700 pt-3">
        <h3 className="text-gray-300 mb-2">Fields</h3>

        {(value.fields || []).map((field, i) => (
          <div key={i} className="bg-[#0f1117] p-3 rounded border border-gray-700 mb-2 space-y-2">
            <input
              placeholder="Field name"
              className="w-full bg-[#1f2330] p-2 rounded border border-gray-600 text-white"
              value={field.name}
              onChange={(e) => {
                const f = [...value.fields];
                f[i].name = e.target.value;
                update({ fields: f });
              }}
            />
            <input
              placeholder="Field value"
              className="w-full bg-[#1f2330] p-2 rounded border border-gray-600 text-white"
              value={field.value}
              onChange={(e) => {
                const f = [...value.fields];
                f[i].value = e.target.value;
                update({ fields: f });
              }}
            />

            <DeleteButton
              onClick={() => {
                const f = [...value.fields];
                f.splice(i, 1);
                update({ fields: f });
              }}
            />
          </div>
        ))}

        <button
          className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg"
          onClick={() =>
            update({
              fields: [...(value.fields || []), { name: "", value: "", inline: false }],
            })
          }
        >
          Add field
        </button>

      </div>
    </div>
  );
}