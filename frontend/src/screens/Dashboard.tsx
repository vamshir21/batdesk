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

  return (
    <div className={`dashboard${connected ? "" : " dimmed"}`}>
      <section className="gauges">
        <Gauge label="CPU" value={cpu} tone={cpu != null ? meterTone(cpu) : undefined} />
        <Gauge label="RAM" value={ram} tone={ram != null ? meterTone(ram) : undefined} />
        <Gauge label="DISK" value={disk} tone={disk != null ? meterTone(disk) : undefined} />
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
        />
        <Gauge
          label="BAT"
          value={status?.battery.available ? bat : null}
          tone={
            status?.battery.charging ? "ok" : bat != null ? meterTone(bat, true) : undefined
          }
        />
      </section>

      <div className="dash-meta">
        <span>
          {status
            ? formatUptime(
                status.boot_duration.days,
                status.boot_duration.hours,
                status.boot_duration.minutes,
              )
            : "--"}{" "}
          up
        </span>
        <span>
          {status
            ? `${Math.round(status.network.down_kbps)}↓ ${Math.round(status.network.up_kbps)}↑ KB/s`
            : "NET --"}
        </span>
      </div>

      <NowPlayingCard track={audio?.now_playing} />

      <section className="quick-row">
        <button type="button" className="quick" onClick={() => void run(api.lock)}>
          <Icon name="lock" />
          Lock
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
          <Icon name={audio?.muted ? "mute" : "unmute"} />
          {audio?.muted ? "Unmute" : "Mute"}
        </button>
        <button
          type="button"
          className={`quick${status?.keep_awake ? " accent" : ""}`}
          onClick={() => void run(() => api.keepAwake(!status?.keep_awake))}
        >
          Stay up
        </button>
      </section>
    </div>
  );
}
