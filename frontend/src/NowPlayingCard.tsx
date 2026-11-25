import { useEffect, useState } from "react";
import { api } from "./api";
import type { NowPlaying } from "./types";

type Props = {
  track: NowPlaying | null | undefined;
};

export function NowPlayingCard({ track }: Props) {
  const [art, setArt] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    if (!track?.has_art) {
      setArt(null);
      return;
    }

    void api.art().then((url) => {
      if (cancelled) {
        if (url) {
          URL.revokeObjectURL(url);
        }
        return;
      }
      objectUrl = url;
      setArt(url);
    });

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [track?.has_art, track?.title, track?.artist, track?.album]);

  if (!track?.available) {
    return (
      <div className="now-playing-card idle">
        <div className="art-frame empty">
          <svg className="art-placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <div className="track-info">
          <div className="track-status-pill standby">
            <span className="dot" />
            <span>STANDBY</span>
          </div>
          <h3 className="track-title">NO ACTIVE AUDIO FEED</h3>
          <p className="track-sub">Media player disconnected or idle on PC</p>
        </div>
      </div>
    );
  }

  const title = track.title ?? "Unknown Title";
  const artist = [track.artist, track.album].filter(Boolean).join(" • ");
  const isPlaying = track.playing;

  return (
    <div className={`now-playing-card${isPlaying ? " is-playing" : " is-paused"}`}>
      <div className="art-frame">
        {art ? (
          <img src={art} alt="" className="art-image" />
        ) : (
          <div className="art-fallback">
            <span className="art-fallback-icon">♪</span>
          </div>
        )}
        <div className="art-overlay" />
      </div>

      <div className="track-info">
        <div className="track-header-row">
          <div className={`track-status-pill ${isPlaying ? "live" : "paused"}`}>
            <span className="dot" />
            <span>{isPlaying ? "PLAYING" : "PAUSED"}</span>
          </div>
          {track.player && <span className="player-badge">{track.player}</span>}

          {/* Animated Equalizer Bars */}
          {isPlaying && (
            <div className="audio-equalizer" aria-hidden="true">
              <span className="eq-bar bar-1" />
              <span className="eq-bar bar-2" />
              <span className="eq-bar bar-3" />
              <span className="eq-bar bar-4" />
            </div>
          )}
        </div>

        <h3 className="track-title" title={title}>
          {title}
        </h3>
        
        <p className="track-sub" title={artist || "Unknown Artist"}>
          {artist || track.player || "Media Output"}
        </p>
      </div>
    </div>
  );
}
