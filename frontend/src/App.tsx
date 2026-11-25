import { useEffect, useState } from "react";
import { BatMark } from "./BatMark";
import { api } from "./api";
import { Icon } from "./icons";
import { applyTheme, loadSettings } from "./settings";
import { Controls } from "./screens/Controls";
import { Dashboard } from "./screens/Dashboard";
import { Network } from "./screens/Network";
import { SettingsScreen } from "./screens/Settings";
import { System } from "./screens/System";
import type { AudioStatus, BrightnessStatus, Screen, Settings, SystemStatus } from "./types";
import "./App.css";

const NAV: { id: Screen; label: string; code: string; icon: "dash" | "controls" | "network" | "system" | "settings" }[] = [
  { id: "dash", label: "CAVE", code: "HUD-01", icon: "dash" },
  { id: "controls", label: "OPS", code: "CTL-02", icon: "controls" },
  { id: "network", label: "NET", code: "WLS-03", icon: "network" },
  { id: "system", label: "CORE", code: "SYS-04", icon: "system" },
  { id: "settings", label: "CFG", code: "CFG-05", icon: "settings" },
];

function App() {
  const [screen, setScreen] = useState<Screen>("dash");
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [audio, setAudio] = useState<AudioStatus | null>(null);
  const [brightness, setBrightness] = useState<BrightnessStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{
    title: string;
    action: () => Promise<void>;
  } | null>(null);

  async function refreshAudio() {
    setAudio(await api.audio());
  }

  async function refreshBrightness() {
    setBrightness(await api.brightness());
  }

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    if (!error) {
      return;
    }
    const id = window.setTimeout(() => setError(null), 4000);
    return () => window.clearTimeout(id);
  }, [error]);

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      try {
        const [nextStatus, nextAudio] = await Promise.all([
          api.status(),
          api.audio().catch(() => null),
        ]);
        if (cancelled) {
          return;
        }
        setStatus(nextStatus);
        if (nextAudio) {
          setAudio(nextAudio);
        }
        setConnected(true);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setConnected(false);
          setError(err instanceof Error ? err.message : "Offline");
        }
      }
    }

    void tick();
    const id = window.setInterval(() => void tick(), settings.refreshMs);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [settings.refreshMs, settings.serverUrl, settings.apiKey]);

  useEffect(() => {
    void api.audio().then(setAudio).catch(() => undefined);
    void api.brightness().then(setBrightness).catch(() => undefined);
  }, [settings.serverUrl, settings.apiKey]);

  function onNeedConfirm(title: string, action: () => Promise<void>) {
    setConfirm({ title, action });
  }

  async function confirmYes() {
    if (!confirm) {
      return;
    }
    try {
      await confirm.action();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setConfirm(null);
    }
  }

  const currentNav = NAV.find((n) => n.id === screen);

  return (
    <div className={`batdesk-shell${connected ? " is-connected" : " is-offline"}`}>
      {/* Background Subtle Cyber Mesh */}
      <div className="cyber-grid-mesh" aria-hidden="true" />

      {/* Top Tactical Header */}
      <header className="tactical-topbar">
        <div className="brand-group">
          <BatMark className="brand-logo" size={34} />
          <div className="brand-titles">
            <h1 className="brand-name">BATDESK</h1>
            <span className="brand-tagline">COMMAND TERMINAL v2.0</span>
          </div>
        </div>

        <div className="topbar-center-view">
          <span className="active-view-code">{currentNav?.code}</span>
          <span className="active-view-name">/ {currentNav?.label}</span>
        </div>

        <div className="host-status-badge">
          <div className={`status-indicator ${connected ? "online" : "offline"}`}>
            <span className="pulse-dot" />
            <span className="status-label">{connected ? "ONLINE" : "LINK SEVERED"}</span>
          </div>
          <span className="host-name">{status?.host.hostname ?? "DESKTOP-PC"}</span>
        </div>
      </header>

      {/* Main Responsive Viewport */}
      <main className="tactical-main-viewport">
        {screen === "dash" && (
          <Dashboard
            status={status}
            audio={audio}
            connected={connected}
            onError={setError}
            onNeedConfirm={onNeedConfirm}
            refreshAudio={refreshAudio}
          />
        )}
        {screen === "controls" && (
          <Controls
            audio={audio}
            brightness={brightness}
            onError={setError}
            onNeedConfirm={onNeedConfirm}
            refreshAudio={refreshAudio}
            refreshBrightness={refreshBrightness}
            status={status}
          />
        )}
        {screen === "network" && <Network onError={setError} />}
        {screen === "system" && <System status={status} />}
        {screen === "settings" && (
          <SettingsScreen settings={settings} onSave={setSettings} onError={setError} />
        )}
      </main>

      {/* Toast Notification Alert */}
      {error && (
        <button
          type="button"
          className="tactical-toast"
          onClick={() => setError(null)}
          aria-live="assertive"
        >
          <span className="toast-badge">ALERT</span>
          <span className="toast-message">{error}</span>
        </button>
      )}

      {/* Destructive Action Confirmation Dialog */}
      {confirm && (
        <div className="tactical-modal-overlay">
          <div className="tactical-modal-dialog">
            <div className="dialog-hazard-bar" />
            <div className="dialog-content">
              <span className="dialog-kicker">AUTHORIZATION OVERRIDE</span>
              <h3 className="dialog-title">CONFIRM PROTOCOL EXECUTION</h3>
              <p className="dialog-prompt">{confirm.title}</p>
              
              <div className="dialog-actions">
                <button
                  type="button"
                  className="tactical-btn cancel-btn"
                  onClick={() => setConfirm(null)}
                >
                  ABORT
                </button>
                <button
                  type="button"
                  className="tactical-btn confirm-btn"
                  onClick={() => void confirmYes()}
                >
                  AUTHORIZE EXECUTION
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tactical Bottom Navigation Dock */}
      <nav className="tactical-navbar" aria-label="Deck Navigation">
        {NAV.map((item) => (
          <button
            type="button"
            key={item.id}
            className={`nav-tab-btn${screen === item.id ? " is-active" : ""}`}
            onClick={() => setScreen(item.id)}
          >
            <div className="nav-icon-wrap">
              <Icon name={item.icon} />
            </div>
            <span className="nav-label">{item.label}</span>
            <span className="nav-active-pip" />
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
