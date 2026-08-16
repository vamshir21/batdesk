import { useState } from "react";

import { api } from "../api";
import { applyTheme, saveSettings } from "../settings";
import type { Settings } from "../types";

type Props = {
  settings: Settings;
  onSave: (settings: Settings) => void;
  onError: (message: string) => void;
};

const APPS = [
  { id: "files", label: "Files" },
  { id: "browser", label: "Browser" },
  { id: "terminal", label: "Terminal" },
  { id: "settings", label: "Settings" },
  { id: "spotify", label: "Spotify" },
  { id: "code", label: "VS Code" },
];

export function SettingsScreen({ settings, onSave, onError }: Props) {
  const [serverUrl, setServerUrl] = useState(settings.serverUrl);
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [refreshMs, setRefreshMs] = useState(String(settings.refreshMs / 1000));
  const [theme, setTheme] = useState(settings.theme);
  const [saved, setSaved] = useState(false);
  const [clip, setClip] = useState("");
  const [note, setNote] = useState("");
  const [url, setUrl] = useState("https://");

  function save() {
    const next: Settings = {
      serverUrl: serverUrl.trim(),
      apiKey: apiKey.trim(),
      refreshMs: Math.max(1, Number(refreshMs) || 2) * 1000,
      theme,
    };
    saveSettings(next);
    applyTheme(next.theme);
    onSave(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  async function run(action: () => Promise<unknown>) {
    try {
      await action();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Request failed");
    }
  }

  return (
    <div className="settings-grid three">
      <section className="panel form">
        <p className="panel-kicker">Connection</p>
        <label>
          PC address
          <input
            value={serverUrl}
            onChange={(event) => setServerUrl(event.target.value)}
            placeholder="Leave empty on this PC"
          />
        </label>
        <label>
          API key
          <input
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="Only if the backend has one"
          />
        </label>
        <label>
          Refresh seconds
          <input
            inputMode="numeric"
            value={refreshMs}
            onChange={(event) => setRefreshMs(event.target.value)}
          />
        </label>
        <div className="segmented">
          <button type="button" className={theme === "dark" ? "on" : ""} onClick={() => setTheme("dark")}>
            Night
          </button>
          <button type="button" className={theme === "dim" ? "on" : ""} onClick={() => setTheme("dim")}>
            Dim
          </button>
        </div>
        <button type="button" className={`quick wide${saved ? " accent" : ""}`} onClick={save}>
          {saved ? "Saved" : "Save"}
        </button>
      </section>

      <section className="panel form">
        <p className="panel-kicker">Send to PC</p>
        <label>
          Clipboard
          <input value={clip} onChange={(event) => setClip(event.target.value)} placeholder="Text to paste on the PC" />
        </label>
        <button type="button" className="quick wide" onClick={() => void run(() => api.clipboard(clip))}>
          Copy on PC
        </button>
        <label>
          Notification
          <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ping the laptop" />
        </label>
        <button
          type="button"
          className="quick wide"
          onClick={() => void run(() => api.notify("BatDesk", note))}
        >
          Notify
        </button>
        <label>
          Open URL
          <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://" />
        </label>
        <button type="button" className="quick wide" onClick={() => void run(() => api.openUrl(url))}>
          Open
        </button>
      </section>

      <section className="panel form">
        <p className="panel-kicker">Launch</p>
        <div className="launch-grid">
          {APPS.map((app) => (
            <button
              key={app.id}
              type="button"
              className="quick"
              onClick={() => void run(() => api.launch(app.id))}
            >
              {app.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
