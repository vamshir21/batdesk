import { useEffect, useState } from "react";
import { NowPlayingCard } from "../NowPlayingCard";
import { api } from "../api";
import { Icon } from "../icons";
import type { AudioStatus, BrightnessStatus, SystemStatus } from "../types";

type Props = {
  audio: AudioStatus | null;
  brightness: BrightnessStatus | null;
  status: SystemStatus | null;
  onError: (message: string) => void;
  onNeedConfirm: (title: string, action: () => Promise<void>) => void;
  refreshAudio: () => Promise<void>;
  refreshBrightness: () => Promise<void>;
};

export function Controls({
  audio,
  brightness,
  status,
  onError,
  onNeedConfirm,
  refreshAudio,
  refreshBrightness,
}: Props) {
  const [bright, setBright] = useState(brightness?.brightness ?? 50);
  const [volume, setVolume] = useState(audio?.volume ?? 0);

  useEffect(() => {
    if (brightness) {
      setBright(brightness.brightness);
    }
  }, [brightness]);

  useEffect(() => {
    if (audio) {
      setVolume(audio.volume);
    }
  }, [audio]);

  async function run(action: () => Promise<unknown>) {
    try {
      await action();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Request failed");
    }
  }

  return (
    <div className="screen-view controls-view">
      <div className="controls-responsive-layout">
        {/* Section 1: Levels (Sliders & Sinks) */}
        <section className="tactical-card panel-levels">
          <div className="card-header">
            <div>
              <span className="card-kicker">HARDWARE LEVEL CONTROL</span>
              <h2 className="card-title">LEVELS & SINKS</h2>
            </div>
          </div>

          <div className="sliders-container">
            {/* Display Brightness */}
            <div className="custom-slider-block">
              <div className="slider-header-row">
                <span className="slider-name">DISPLAY BRIGHTNESS</span>
                <span className="slider-val-badge highlight-gold">{bright}%</span>
              </div>
              <div className="slider-input-wrapper">
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={bright}
                  className="tactical-range"
                  onChange={(e) => setBright(Number(e.target.value))}
                  onPointerUp={() =>
                    void run(async () => {
                      await api.setBrightness(bright);
                      await refreshBrightness();
                    })
                  }
                />
              </div>
            </div>

            {/* Volume Gain */}
            <div className="custom-slider-block">
              <div className="slider-header-row">
                <span className="slider-name">MASTER AUDIO GAIN</span>
                <span className={`slider-val-badge ${audio?.muted ? "is-muted" : "highlight-cyan"}`}>
                  {audio?.muted ? "MUTED" : `${volume}%`}
                </span>
              </div>
              <div className="slider-input-wrapper">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volume}
                  className="tactical-range"
                  onChange={(e) => setVolume(Number(e.target.value))}
                  onPointerUp={() =>
                    void run(async () => {
                      await api.setVolume(volume);
                      await refreshAudio();
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Quick Mute Toggles */}
          <div className="button-pair-grid">
            <button
              type="button"
              className={`tactical-btn toggle-btn${audio?.muted ? " is-active alert" : ""}`}
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
              <Icon name={audio?.muted ? "mute" : "unmute"} />
              <span>{audio?.muted ? "UNMUTE" : "MUTE AUDIO"}</span>
            </button>

            <button
              type="button"
              className={`tactical-btn toggle-btn${audio?.mic_muted ? " is-active alert" : ""}`}
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
              <Icon name={audio?.mic_muted ? "mic-off" : "mic"} />
              <span>{audio?.mic_muted ? "UNMUTE MIC" : "MUTE MIC"}</span>
            </button>
          </div>

          {/* Output Sink Selection */}
          {audio && audio.sinks.length > 0 && (
            <div className="output-sink-wrapper">
              <label htmlFor="sink-select" className="sink-label">
                OUTPUT SINK ROUTE
              </label>
              <div className="custom-select-frame">
                <select
                  id="sink-select"
                  className="tactical-select"
                  value={audio.sinks.find((sink) => sink.default)?.name ?? ""}
                  onChange={(e) =>
                    void run(async () => {
                      await api.setSink(e.target.value);
                      await refreshAudio();
                    })
                  }
                >
                  {audio.sinks.map((sink) => (
                    <option key={sink.name} value={sink.name}>
                      {sink.description}
                    </option>
                  ))}
                </select>
                <span className="select-arrow">▼</span>
              </div>
            </div>
          )}
        </section>

        {/* Section 2: Media Transport Hub */}
        <section className="tactical-card panel-media">
          <div className="card-header">
            <div>
              <span className="card-kicker">MPRIS PLAYBACK DESK</span>
              <h2 className="card-title">MEDIA REMOTE</h2>
            </div>
          </div>

          <NowPlayingCard track={audio?.now_playing} />

          <div className="media-transport-grid">
            <button
              type="button"
              className="tactical-btn transport-btn seek-btn"
              onClick={() => void run(() => api.seek(-10))}
              title="Seek -10s"
            >
              <span>−10s</span>
            </button>

            <button
              type="button"
              className={`tactical-btn transport-btn play-btn${audio?.now_playing?.playing ? " is-playing" : ""}`}
              onClick={() => void run(api.playPause)}
              title={audio?.now_playing?.playing ? "Pause" : "Play"}
            >
              <Icon name={audio?.now_playing?.playing ? "pause" : "play"} />
              <span>{audio?.now_playing?.playing ? "PAUSE" : "PLAY"}</span>
            </button>

            <button
              type="button"
              className="tactical-btn transport-btn seek-btn"
              onClick={() => void run(() => api.seek(10))}
              title="Seek +10s"
            >
              <span>+10s</span>
            </button>
          </div>

          <div className="media-secondary-grid">
            <button
              type="button"
              className="tactical-btn icon-btn"
              onClick={() => void run(api.previous)}
              title="Previous Track"
            >
              <Icon name="prev" />
              <span>PREV</span>
            </button>

            <button
              type="button"
              className="tactical-btn icon-btn"
              onClick={() => void run(api.fullscreen)}
              title="Toggle Fullscreen"
            >
              <Icon name="fullscreen" />
              <span>FULL</span>
            </button>

            <button
              type="button"
              className="tactical-btn icon-btn"
              onClick={() => void run(api.next)}
              title="Next Track"
            >
              <Icon name="next" />
              <span>NEXT</span>
            </button>
          </div>
        </section>

        {/* Section 3: Power Operations & Safety */}
        <section className="tactical-card panel-power">
          <div className="card-header">
            <div>
              <span className="card-kicker">SECURITY & DISPATCH</span>
              <h2 className="card-title">POWER ACTIONS</h2>
            </div>
          </div>

          <div className="power-actions-grid">
            <button
              type="button"
              className="tactical-btn power-btn"
              onClick={() => void run(api.lock)}
            >
              <Icon name="lock" />
              <span>LOCK DESKTOP</span>
            </button>

            <button
              type="button"
              className={`tactical-btn power-btn${status?.keep_awake ? " is-active" : ""}`}
              onClick={() => void run(() => api.keepAwake(!status?.keep_awake))}
            >
              <span className={`status-led ${status?.keep_awake ? "on" : "off"}`} />
              <span>{status?.keep_awake ? "KEEP AWAKE (ON)" : "KEEP AWAKE (OFF)"}</span>
            </button>

            <button
              type="button"
              className="tactical-btn power-btn"
              onClick={() =>
                onNeedConfirm("Suspend the PC into low-power sleep mode?", async () => {
                  await api.sleep();
                })
              }
            >
              <Icon name="sleep" />
              <span>SUSPEND / SLEEP</span>
            </button>

            <button
              type="button"
              className="tactical-btn power-btn danger-btn"
              onClick={() =>
                onNeedConfirm("Initiate complete PC system reboot?", async () => {
                  await api.restart();
                })
              }
            >
              <Icon name="refresh" />
              <span>RESTART PC</span>
            </button>

            <button
              type="button"
              className="tactical-btn power-btn critical-danger-btn"
              onClick={() =>
                onNeedConfirm("Initiate complete PC shutdown protocol?", async () => {
                  await api.shutdown();
                })
              }
            >
              <Icon name="power" />
              <span>POWER DOWN</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
