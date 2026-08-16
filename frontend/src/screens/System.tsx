import { formatPct, formatTemp, formatUptime, meterTone, tempTone } from "../format";
import { Meter } from "../ui";
import type { SystemStatus } from "../types";

type Props = {
  status: SystemStatus | null;
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="kv">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function System({ status }: Props) {
  if (!status) {
    return <div className="screen muted pad">Waiting for the PC…</div>;
  }

  const up = formatUptime(
    status.boot_duration.days,
    status.boot_duration.hours,
    status.boot_duration.minutes,
  );

  return (
    <div className="system-grid">
      <section className="panel">
        <p className="panel-kicker">Machine</p>
        <Row label="Host" value={status.host.hostname} />
        <Row label="OS" value={status.host.os} />
        <Row label="Kernel" value={status.host.kernel} />
        <Row label="CPU" value={status.host.machine} />
        <Row
          label="Cores"
          value={`${status.cpu.physical_cores ?? "--"} phys · ${status.cpu.logical_cores ?? "--"} log`}
        />
        <Row
          label="Clock"
          value={
            status.frequency.current_mhz
              ? `${Math.round(status.frequency.current_mhz)} MHz`
              : "--"
          }
        />
        <Row label="Uptime" value={up} />
      </section>

      <section className="panel">
        <p className="panel-kicker">Load</p>
        <Row label="CPU" value={formatPct(status.cpu.usage_percent)} />
        <Meter value={status.cpu.usage_percent} tone={meterTone(status.cpu.usage_percent)} />
        <Row
          label="RAM"
          value={`${status.memory.used_gb} / ${status.memory.total_gb} GB`}
        />
        <Meter value={status.memory.percent} tone={meterTone(status.memory.percent)} />
        <Row
          label="Disk"
          value={`${status.disk.used_gb} / ${status.disk.total_gb} GB`}
        />
        <Meter value={status.disk.percent} tone={meterTone(status.disk.percent)} />
        <Row
          label="Temp"
          value={
            status.temperature.available
              ? formatTemp(status.temperature.cpu_temp)
              : "--"
          }
        />
        <Meter
          value={status.temperature.cpu_temp}
          tone={tempTone(status.temperature.cpu_temp)}
        />
        <Row
          label="Battery"
          value={
            status.battery.available
              ? `${formatPct(status.battery.percent)}${status.battery.charging ? " charging" : ""}`
              : "Desktop"
          }
        />
        <Row
          label="NET"
          value={`${Math.round(status.network.down_kbps)} KB/s down · ${Math.round(status.network.up_kbps)} KB/s up`}
        />
        <Row
          label="GPU"
          value={
            status.gpu.available
              ? `${status.gpu.name ?? "GPU"} · ${Math.round(status.gpu.usage_percent ?? 0)}% · ${Math.round(status.gpu.temperature ?? 0)}°`
              : "Not reported"
          }
        />
        {status.gpu.available && (
          <Meter
            value={status.gpu.usage_percent}
            tone={status.gpu.usage_percent != null ? meterTone(status.gpu.usage_percent) : undefined}
          />
        )}
        <Row label="AWAKE" value={status.keep_awake ? "Inhibited" : "Normal idle"} />
      </section>
    </div>
  );
}
