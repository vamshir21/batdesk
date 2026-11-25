import { useState } from "react";
import { api } from "../api";
import { applyTheme, saveSettings } from "../settings";
import type { Settings } from "../types";

type Props = {
  settings: Settings;
  onSave: (settings: Settings) => void;
  onError: (message: string) => void;
};

const STREAMING = [
  { id: "hotstar", label: "JIO HOTSTAR", icon: "★" },
  { id: "youtube", label: "YOUTUBE", icon: "▶" },
  { id: "netflix", label: "NETFLIX", icon: "■" },
];

const APPS = [
  { id: "files", label: "FILES / NAUTILUS", icon: "📁" },
  { id: "browser", label: "BRAVE BROWSER", icon: "🦁" },
  { id: "terminal", label: "TERMINAL", icon: ">_" },
  { id: "settings", label: "GNOME SETTINGS", icon: "⚙" },
  { id: "spotify", label: "SPOTIFY", icon: "♫" },
  { id: "code", label: "VS CODE", icon: "{ }" },
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
    window.setTimeout(() => setSaved(false), 2000);
  }

  async function run(action: () => Promise<unknown>) {
    try {
      await action();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Request failed");
    }
  }

  return (
    <div className="screen-view settings-view">
      <div className="settings-responsive-grid">
        {/* Launcher Deck */}
        <section className="tactical-card settings-card">
          <div className="card-header">
            <span className="card-kicker">RAPID DISPATCH</span>
            <h2 className="card-title">APPLICATION LAUNCHER</h2>
          </div>

          <div className="launcher-group">
            <span className="launcher-subhead">STREAMING SITES (BRAVE)</span>
            <div className="launcher-grid-streaming">
              {STREAMING.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  className="tactical-btn launcher-btn stream"
                  onClick={() => void run(() => api.launch(app.id))}
                >
                  <span className="launcher-icon">{app.icon}</span>
                  <span>{app.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="launcher-group">
            <span className="launcher-subhead">SYSTEM UTILITIES</span>
            <div className="launcher-grid-apps">
              {APPS.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  className="tactical-btn launcher-btn"
                  onClick={() => void run(() => api.launch(app.id))}
                >
                  <span className="launcher-icon">{app.icon}</span>
                  <span>{app.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Remote Connection Parameters */}
        <section className="tactical-card settings-card">
          <div className="card-header">
            <span className="card-kicker">CLIENT-SERVER PARAMETERS</span>
            <h2 className="card-title">CONNECTION & THEME</h2>
          </div>

          <div className="settings-form">
            <div className="input-group">
              <label htmlFor="pc-addr">HOST IP ADDRESS / URL</label>
              <input
                id="pc-addr"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="http://192.168.1.14:8000"
                className="tactical-input"
              />
              <span className="input-hint">Default uses window.location when served from PC</span>
            </div>

            <div className="input-group">
              <label htmlFor="api-key">X-API-KEY TOKEN</label>
              <input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Optional shared secret from .env"
                className="tactical-input"
              />
            </div>

            <div className="input-group">
              <label htmlFor="refresh-interval">TELEMETRY POLL RATE (SECONDS)</label>
              <input
                id="refresh-interval"
                inputMode="numeric"
                value={refreshMs}
                onChange={(e) => setRefreshMs(e.target.value)}
                className="tactical-input"
              />
            </div>

            <div className="input-group">
              <label>HUD THEME PALETTE</label>
              <div className="theme-toggle-grid">
                <button
                  type="button"
                  className={`theme-btn${theme === "dark" ? " is-active" : ""}`}
                  onClick={() => setTheme("dark")}
                >
                  <span className="theme-swatch dark" />
                  <span>DARK CARBON</span>
                </button>
                <button
                  type="button"
                  className={`theme-btn${theme === "dim" ? " is-active" : ""}`}
                  onClick={() => setTheme("dim")}
                >
                  <span className="theme-swatch dim" />
                  <span>DIM SLATE</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              className={`tactical-btn is-active save-config-btn${saved ? " is-saved" : ""}`}
              onClick={save}
            >
              <span>{saved ? "CONFIG SAVED TO STORAGE" : "APPLY & SAVE SETTINGS"}</span>
            </button>
          </div>
        </section>

        {/* Remote PC Command Terminal */}
        <section className="tactical-card settings-card">
          <div className="card-header">
            <span className="card-kicker">REMOTE PC INGESTION</span>
            <h2 className="card-title">DISPATCH TO HOST</h2>
          </div>

          <div className="settings-form">
            <div className="input-group">
              <label htmlFor="clip-in">DESKTOP CLIPBOARD SYNC</label>
              <div className="input-with-btn">
                <input
                  id="clip-in"
                  value={clip}
                  onChange={(e) => setClip(e.target.value)}
                  placeholder="Paste text to inject into host clipboard"
                  className="tactical-input"
                />
                <button
                  type="button"
                  className="tactical-btn action-sub-btn"
                  onClick={() => void run(() => api.clipboard(clip))}
                >
                  SYNC
                </button>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="notify-in">DESKTOP NOTIFICATION</label>
              <div className="input-with-btn">
                <input
                  id="notify-in"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Notification message to display on PC"
                  className="tactical-input"
                />
                <button
                  type="button"
                  className="tactical-btn action-sub-btn"
                  onClick={() => void run(() => api.notify("BatDesk Tablet", note))}
                >
                  NOTIFY
                </button>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="url-in">OPEN WEB URL (BRAVE)</label>
              <div className="input-with-btn">
                <input
                  id="url-in"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="tactical-input"
                />
                <button
                  type="button"
                  className="tactical-btn action-sub-btn"
                  onClick={() => void run(() => api.openUrl(url))}
                >
                  OPEN
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
