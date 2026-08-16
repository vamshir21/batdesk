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

const NAV: { id: Screen; label: string; icon: "dash" | "controls" | "network" | "system" | "settings" }[] =
  [
    { id: "dash", label: "Cave", icon: "dash" },
    { id: "controls", label: "Ops", icon: "controls" },
    { id: "network", label: "Net", icon: "network" },
    { id: "system", label: "Core", icon: "system" },
    { id: "settings", label: "Cfg", icon: "settings" },
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

  return (
    <div className={`shell${connected ? "" : " offline"}`}>
      <header className="topbar">
        <div className="brand">
          <BatMark className="brand-bat" />
          BatDesk
        </div>
        <div className="pc-status">
          <span className={`dot${connected ? " on" : ""}`} />
          <span className="host">{status?.host.hostname ?? "PC"}</span>
          <span className="ver">v2</span>
        </div>
      </header>

      <main>
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

      {error && (
        <button type="button" className="toast" onClick={() => setError(null)}>
          {error}
        </button>
      )}

      {confirm && (
        <div className="overlay">
          <div className="dialog">
            <p className="panel-kicker">Authorization</p>
            <p>{confirm.title}</p>
            <div className="btn-grid compact">
              <button type="button" className="quick ghost" onClick={() => setConfirm(null)}>
                Cancel
              </button>
              <button type="button" className="quick danger" onClick={() => void confirmYes()}>
                Do it
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="bottom-nav">
        {NAV.map((item) => (
          <button
            type="button"
            key={item.id}
            className={`nav-btn${screen === item.id ? " active" : ""}`}
            onClick={() => setScreen(item.id)}
          >
            <Icon name={item.icon} />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
