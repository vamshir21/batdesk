import { useState, useEffect } from "react";
import { Gauge } from "../Gauge";
import { NowPlayingCard } from "../NowPlayingCard";
import { api } from "../api";
import { formatUptime, meterTone, tempTone } from "../format";
import { Icon } from "../icons";
import type { AudioStatus, SystemStatus } from "../types";

type Props = {
  status: SystemStatus | null;
  audio: AudioStatus | null;
  connected: boolean;
  onError: (message: string) => void;
  onNeedConfirm: (title: string, action: () => Promise<void>) => void;
  refreshAudio: () => Promise<void>;
};

export function Dashboard({
  status,
  audio,
  connected,
  onError,
  onNeedConfirm,
  refreshAudio,
}: Props) {
  const [quickVolume, setQuickVolume] = useState(audio?.volume ?? 0);

  useEffect(() => {
    if (audio) {
      setQuickVolume(audio.volume);
    }
  }, [audio]);

  async function run(action: () => Promise<unknown>) {
    try {
      await action();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Request failed");
    }
  }

  const cpu = status?.cpu.usage_percent;
  const ram = status?.memory.percent;
  const disk = status?.disk.percent;
  const temp = status?.temperature.cpu_temp;
  const bat = status?.battery.percent;
  const gpu = status?.gpu.usage_percent;
  const isCharging = status?.battery.charging;

  const ramSubtitle = status ? `${status.memory.used_gb}G` : undefined;
  const diskSubtitle = status ? `${status.disk.used_gb}G` : undefined;
  const gpuSubtitle = status?.gpu.available ? `${Math.round(status.gpu.temperature ?? 0)}°` : undefined;
  const batSubtitle = status?.battery.available
    ? isCharging
      ? "AC CHG"
      : "BATT"
    : "MAINS";

  return (
    <div className={`dashboard-hub${connected ? "" : " is-dimmed"}`}>
      {/* Top Telemetry Stats Strip */}
      <section className="pro-telemetry-banner">
        <div className="telemetry-chip">
          <span className="chip-label">NODE</span>
          <span className={`chip-val ${connected ? "text-ok" : "text-danger"}`}>
            {connected ? "ONLINE" : "DISCONNECTED"}
          </span>
        </div>

        <div className="telemetry-chip">
          <span className="chip-label">UPTIME</span>
          <span className="chip-val">
            {status
              ? formatUptime(
                  status.boot_duration.days,
                  status.boot_duration.hours,
                  status.boot_duration.minutes,
                )
              : "--"}
          </span>
        </div>

        <div className="telemetry-chip">
          <span className="chip-label">TRAFFIC</span>
          <span className="chip-val text-cyan">
            {status
              ? `${Math.round(status.network.down_kbps)}↓ ${Math.round(status.network.up_kbps)}↑ KB/s`
              : "--"}
          </span>
        </div>

        <div className="telemetry-chip">
          <span className="chip-label">AWAKE</span>
          <span className={`chip-val ${status?.keep_awake ? "text-gold" : "text-muted"}`}>
            {status?.keep_awake ? "INHIBITED" : "NORMAL"}
          </span>
        </div>
      </section>

      {/* Primary Radial Dials Section (3x2 on mobile portrait, 6x1 on landscape/desktop) */}
      <section className="pro-dials-section" aria-label="System Metrics">
        <div className="pro-dials-grid">
          <Gauge
            label="CPU"
            value={cpu}
            tone={cpu != null ? meterTone(cpu) : undefined}
          />
          <Gauge
            label="RAM"
            value={ram}
            tone={ram != null ? meterTone(ram) : undefined}
            subtitle={ramSubtitle}
          />
          <Gauge
            label="DISK"
            value={disk}
            tone={disk != null ? meterTone(disk) : undefined}
            subtitle={diskSubtitle}
          />
          <Gauge
            label="TEMP"
            value={status?.temperature.available ? temp : null}
            unit="°"
            tone={tempTone(temp)}
          />
          <Gauge
            label="GPU"
            value={status?.gpu.available ? gpu : null}
            tone={gpu != null ? meterTone(gpu) : undefined}
            subtitle={gpuSubtitle}
          />
          <Gauge
            label="BAT"
            value={status?.battery.available ? bat : null}
            tone={isCharging ? "ok" : bat != null ? meterTone(bat, true) : undefined}
            subtitle={batSubtitle}
          />
        </div>
      </section>

      {/* Command & Media Integration Deck */}
      <section className="dashboard-twin-deck">
        {/* Media Station */}
        <div className="pro-panel media-deck-panel">
          <div className="panel-top-row">
            <div className="panel-title-group">
              <span className="panel-kicker">MPRIS MEDIA</span>
              <h2 className="panel-heading">AUDIO & PLAYBACK</h2>
            </div>
            {audio && (
              <span className={`audio-pill ${audio.muted ? "muted" : "active"}`}>
                {audio.muted ? "MUTED" : `${quickVolume}%`}
              </span>
            )}
          </div>

          <NowPlayingCard track={audio?.now_playing} />

          {/* Touch Transport Controls */}
          <div className="inline-transport-row">
            <button
              type="button"
              className="pro-btn transport-btn"
              onClick={() => void run(api.previous)}
              title="Previous"
            >
              <Icon name="prev" />
            </button>
            <button
              type="button"
              className="pro-btn transport-btn seek-btn"
              onClick={() => void run(() => api.seek(-10))}
              title="Seek -10s"
            >
              −10s
            </button>
            <button
              type="button"
              className={`pro-btn transport-btn play-btn${audio?.now_playing?.playing ? " is-playing" : ""}`}
              onClick={() => void run(api.playPause)}
              title={audio?.now_playing?.playing ? "Pause" : "Play"}
            >
              <Icon name={audio?.now_playing?.playing ? "pause" : "play"} />
              <span>{audio?.now_playing?.playing ? "PAUSE" : "PLAY"}</span>
            </button>
            <button
              type="button"
              className="pro-btn transport-btn seek-btn"
              onClick={() => void run(() => api.seek(10))}
              title="Seek +10s"
            >
              +10s
            </button>
            <button
              type="button"
              className="pro-btn transport-btn"
              onClick={() => void run(api.next)}
              title="Next"
            >
              <Icon name="next" />
            </button>
            <button
              type="button"
              className="pro-btn transport-btn icon-only"
              onClick={() => void run(api.fullscreen)}
              title="Fullscreen"
            >
              <Icon name="fullscreen" />
            </button>
          </div>

          {/* Quick Volume Slider */}
          <div className="inline-volume-wrap">
            <div className="slider-label-row">
              <span className="sub-label">VOLUME GAIN</span>
              <span className="sub-val">{audio?.muted ? "MUTED" : `${quickVolume}%`}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={quickVolume}
              className="pro-range-slider"
              onChange={(e) => setQuickVolume(Number(e.target.value))}
              onPointerUp={() =>
                void run(async () => {
                  await api.setVolume(quickVolume);
                  await refreshAudio();
                })
              }
            />
          </div>
        </div>

        {/* Quick Operations Deck */}
        <div className="pro-panel command-deck-panel">
          <div className="panel-top-row">
            <div className="panel-title-group">
              <span className="panel-kicker">DESKTOP DISPATCH</span>
              <h2 className="panel-heading">QUICK ACTIONS</h2>
            </div>
            <span className="cmd-chip">CONTROLS</span>
          </div>

          <div className="quick-actions-grid">
            <button
              type="button"
              className="pro-btn action-tile"
              onClick={() => void run(api.lock)}
            >
              <div className="tile-icon-wrap">
                <Icon name="lock" />
              </div>
              <div className="tile-text">
                <span className="tile-title">LOCK</span>
                <span className="tile-sub">Desktop session</span>
              </div>
            </button>

            <button
              type="button"
              className={`pro-btn action-tile${status?.keep_awake ? " is-active" : ""}`}
              onClick={() => void run(() => api.keepAwake(!status?.keep_awake))}
            >
              <div className="tile-icon-wrap">
                <span className={`led-ring ${status?.keep_awake ? "on" : "off"}`} />
              </div>
              <div className="tile-text">
                <span className="tile-title">AWAKE</span>
                <span className="tile-sub">{status?.keep_awake ? "Active (On)" : "Normal idle"}</span>
              </div>
            </button>

            <button
              type="button"
              className={`pro-btn action-tile${audio?.muted ? " is-alert" : ""}`}
              onClick={() =>
                void run(async () => {
                  if (audio?.muted) {
                    await api.unmute();
                  } else {
                    await api.mute();
                  }
                  await refreshAudio();
                })
              }
            >
              <div className="tile-icon-wrap">
                <Icon name={audio?.muted ? "mute" : "unmute"} />
              </div>
              <div className="tile-text">
                <span className="tile-title">{audio?.muted ? "UNMUTE" : "MUTE"}</span>
                <span className="tile-sub">{audio?.muted ? "Muted" : "Speaker live"}</span>
              </div>
            </button>

            <button
              type="button"
              className={`pro-btn action-tile${audio?.mic_muted ? " is-alert" : ""}`}
              onClick={() =>
                void run(async () => {
                  if (audio?.mic_muted) {
                    await api.unmuteMic();
                  } else {
                    await api.muteMic();
                  }
                  await refreshAudio();
                })
              }
            >
              <div className="tile-icon-wrap">
                <Icon name={audio?.mic_muted ? "mic-off" : "mic"} />
              </div>
              <div className="tile-text">
                <span className="tile-title">{audio?.mic_muted ? "MIC ON" : "MIC MUTE"}</span>
                <span className="tile-sub">{audio?.mic_muted ? "Mic off" : "Mic live"}</span>
              </div>
            </button>

            <button
              type="button"
              className="pro-btn action-tile warn-tile"
              onClick={() =>
                onNeedConfirm("Suspend the PC into low-power sleep mode?", async () => {
                  await api.sleep();
                })
              }
            >
              <div className="tile-icon-wrap">
                <Icon name="sleep" />
              </div>
              <div className="tile-text">
                <span className="tile-title">SLEEP</span>
                <span className="tile-sub">Suspend system</span>
              </div>
            </button>

            <button
              type="button"
              className="pro-btn action-tile launch-tile"
              onClick={() => void run(() => api.launch("browser"))}
            >
              <div className="tile-icon-wrap">
                <span className="mini-ico">🦁</span>
              </div>
              <div className="tile-text">
                <span className="tile-title">BRAVE</span>
                <span className="tile-sub">Launch browser</span>
              </div>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
