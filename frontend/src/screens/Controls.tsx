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
    <div className="controls-grid">
      <section className="panel sliders">
        <p className="panel-kicker">Levels</p>
        <label className="slider-block">
          <div className="slider-head">
            <span>Brightness</span>
            <span>{bright}%</span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            value={bright}
            onChange={(event) => setBright(Number(event.target.value))}
            onPointerUp={() =>
              void run(async () => {
                await api.setBrightness(bright);
                await refreshBrightness();
              })
            }
          />
        </label>
        <label className="slider-block">
          <div className="slider-head">
            <span>Volume</span>
            <span>{audio?.muted ? "Muted" : `${volume}%`}</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            onPointerUp={() =>
              void run(async () => {
                await api.setVolume(volume);
                await refreshAudio();
              })
            }
          />
        </label>
        <div className="btn-grid compact">
          <button
            type="button"
            className={`quick${audio?.muted ? " accent" : ""}`}
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
            {audio?.muted ? "Unmute" : "Mute"}
          </button>
          <button
            type="button"
            className={`quick${audio?.mic_muted ? " accent" : ""}`}
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
            {audio?.mic_muted ? "Mic on" : "Mic off"}
          </button>
        </div>
        {audio && audio.sinks.length > 0 && (
          <label className="slider-block">
            Output
            <select
              value={audio.sinks.find((sink) => sink.default)?.name ?? ""}
              onChange={(event) =>
                void run(async () => {
                  await api.setSink(event.target.value);
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
          </label>
        )}
      </section>

      <section className="panel media">
        <p className="panel-kicker">Media</p>
        <NowPlayingCard track={audio?.now_playing} />
        <div className="media-row">
          <button type="button" className="quick icon-only" onClick={() => void run(api.previous)}>
            <Icon name="prev" />
          </button>
          <button type="button" className="quick play" onClick={() => void run(api.playPause)}>
            <Icon name="play" />
            {audio?.now_playing?.playing ? "Pause" : "Play"}
          </button>
          <button type="button" className="quick icon-only" onClick={() => void run(api.next)}>
            <Icon name="next" />
          </button>
        </div>
      </section>

      <section className="panel power-panel">
        <p className="panel-kicker">Power</p>
        <div className="power-grid">
          <button type="button" className="quick" onClick={() => void run(api.lock)}>
            <Icon name="lock" />
            Lock
          </button>
          <button
            type="button"
            className={`quick${status?.keep_awake ? " accent" : ""}`}
            onClick={() => void run(() => api.keepAwake(!status?.keep_awake))}
          >
            Stay up
          </button>
          <button
            type="button"
            className="quick"
            onClick={() =>
              onNeedConfirm("Put the PC to sleep?", async () => {
                await api.sleep();
              })
            }
          >
            <Icon name="sleep" />
            Sleep
          </button>
          <button
            type="button"
            className="quick danger"
            onClick={() =>
              onNeedConfirm("Restart the PC?", async () => {
                await api.restart();
              })
            }
          >
            Restart
          </button>
          <button
            type="button"
            className="quick danger"
            onClick={() =>
              onNeedConfirm("Shut down the PC?", async () => {
                await api.shutdown();
              })
            }
          >
            Off
          </button>
        </div>
      </section>
    </div>
  );
}
