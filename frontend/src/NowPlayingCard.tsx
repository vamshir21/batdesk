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
      <div className="now-playing idle">
        <div className="now-copy">
          <span className="now-kicker">Now playing</span>
          <strong>Nothing on the PC</strong>
        </div>
      </div>
    );
  }

  const title = track.title ?? "Unknown title";
  const artist = [track.artist, track.album].filter(Boolean).join(" · ");

  return (
    <div className={`now-playing${track.playing ? " live" : ""}`}>
      {art ? <img src={art} alt="" className="now-art" /> : <div className="now-art empty" />}
      <div className="now-copy">
        <span className="now-kicker">{track.playing ? "Now playing" : "Paused"}</span>
        <strong>{title}</strong>
        <span className="now-artist">{artist || track.player || "Media"}</span>
      </div>
    </div>
  );
}
