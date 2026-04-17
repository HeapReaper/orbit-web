"use client";

import { useEffect, useState, useRef } from "react";
import SaveButton from "@/app/(dashboard)/dashboard/components/buttons/Save";
import { useNotification } from "@/app/context/NotificationContext";
import PageLoader from "@/app/(dashboard)/dashboard/components/PageLoader";
import { useGuild } from "@/app/context/GuildContext";
import InfoTooltip from "@/app/(dashboard)/dashboard/components/ui/InfoToolTip";

const endpoints = [
  {
    method: "GET",
    path: "/api/bumper",
    description:
      "Returns a list of all users who bumped the server in the last 24 hours",
    response: `[
  {
    "id": "123456789012345678",
    "username": "User1",
    "lastBumped": "2025-12-09T12:00:00Z"
  }
]`,
  },
  {
    method: "GET",
    path: "/api/ServerStats",
    description: "Returns detailed statistics about the server",
    response: `{
  "id": "123456789012345678",
  "name": "My Server",
  "icon": "https://cdn.discordapp.com/icons/.../icon.png",
  "description": "Server description",
  "ownerId": "123456789012345678",
  "createdAt": "2021-01-01T00:00:00.000Z",
  "members": {
    "total": 500,
    "humans": 480,
    "bots": 20,
    "online": 120,
    "idle": 30,
    "dnd": 10,
    "offline": 340
  },
  "boosts": {
    "level": 2,
    "count": 15
  },
  "channels": {
    "total": 40,
    "text": 25,
    "voice": 10,
    "categories": 5
  },
  "roles": 18,
  "verificationLevel": 1,
  "explicitContentFilter": 1
}`,
  },
];

const API_URL = "https://bot.botinorbit.com";

export default function ApiSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { selectedGuild } = useGuild();
  const { notify } = useNotification();
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.title = "API Settings";

    if (!selectedGuild) return;

    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/api-settings?guildId=${selectedGuild}`);
        const data = await res.json();
        setEnabled(data.enabled ?? false);
        setApiKey(data.apiKey ?? "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    void fetchSettings();
  }, [selectedGuild]);

  const generateApiKey = () => {
    const key = [...Array(32)]
      .map(() => Math.random().toString(36)[2])
      .join("");
    setApiKey(key);
  };

  const handleSave = async () => {
    if (!selectedGuild) return;
    setIsSaving(true);

    try {
      const resp = await fetch("/api/api-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guildId: selectedGuild,
          enabled,
          apiKey,
        }),
      });

      if (!resp.ok) {
        notify("Could not save API settings", "", "error");
      } else {
        notify("API settings saved", "", "success");
      }
    } catch (err) {
      notify("Error saving API settings", String(err), "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save after typing or toggling
  useEffect(() => {
    if (!selectedGuild) return;

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      void handleSave();
    }, 1500);
  }, [enabled, apiKey]);

  return (
    <section className="relative bg-[#181b25] p-6 rounded-lg max-w-4xl mx-auto mt-6">
      {loading && <PageLoader />}

      <h1 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
        API Settings
        <InfoTooltip text="Manage your server API key and view available endpoints." />
      </h1>

      {/* Enable Toggle */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400">Enable API</span>
        <button
          type="button"
          onClick={() => setEnabled(!enabled)}
          className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors duration-200 focus:outline-none ${
            enabled ? "bg-[var(--primary-color)]" : "bg-gray-700"
          }`}
        >
          <span
            className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform duration-200 ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* API Key */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">API Key</label>
        <div className="flex gap-2">
          <input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Generate or paste API key"
            className="flex-1 bg-[#0f1117] border border-gray-700 rounded p-2 text-white"
          />
          <button
            type="button"
            onClick={generateApiKey}
            className="bg-[var(--primary-color)] px-3 py-1 rounded text-white hover:brightness-90"
          >
            Generate
          </button>
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="bg-gray-700 px-3 py-1 rounded text-white hover:brightness-90"
          >
            {showKey ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {/* API URL */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">API URL</label>
        <div className="bg-[#0f1117] border border-gray-700 rounded p-2 text-white">
          <p>{API_URL}/api</p>
          {apiKey && (
            <p className="text-gray-400 text-xs mt-1">
              Example header:{" "}
              <code className="bg-gray-700 px-1 rounded text-white">
                Authorization: Bearer API_KEY_HERE
              </code>
              <code className="bg-gray-700 px-1 rounded text-white ms-2">
                X-Guild-ID: {selectedGuild}
              </code>
            </p>
          )}
        </div>
      </div>

      <div className="text-right text-gray-400 text-sm mt-3">
        {isSaving ? "Saving..." : "Auto saved!"}
      </div>

      <SaveButton onClick={handleSave} />

      <h2 className="text-xl font-semibold text-white mt-8">Endpoints</h2>
      <div className="h-px w-full bg-white/10 my-3 mt-2"></div>

      {/* Endpoints */}
      <div className="flex flex-col gap-4">
        {endpoints.map((ep, i) => (
          <div key={i} className="bg-[#0f1117] rounded p-4">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-xs font-semibold px-2 py-1 rounded ${
                  ep.method === "GET"
                    ? "bg-green-600"
                    : ep.method === "POST"
                      ? "bg-blue-600"
                      : ep.method === "PUT"
                        ? "bg-yellow-600"
                        : "bg-red-600"
                }`}
              >
                {ep.method}
              </span>
              <code className="text-sm text-white">{`${API_URL}${ep.path}`}</code>
            </div>

            <pre className="bg-gray-800 text-xs text-white p-2 rounded mb-2 overflow-x-auto">
              {`curl -X GET "https://bot.botinorbit.com/api/bumper" \\
  -H "Authorization: Bearer API_KEY_HERE" \\
  -H "X-Guild-ID: ${selectedGuild}"`}
            </pre>

            <div className="text-gray-300 text-sm whitespace-pre-wrap">{`${ep.description}\n\nResponse:\n${ep.response}`}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
