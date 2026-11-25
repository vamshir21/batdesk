import { formatPct, formatTemp, formatUptime, meterTone, tempTone } from "../format";
import { Meter } from "../ui";
import type { SystemStatus } from "../types";

type Props = {
  status: SystemStatus | null;
};

function TacticalKV({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="tactical-kv-row">
      <span className="kv-label">{label}</span>
      <strong className={`kv-value${highlight ? " is-highlight" : ""}`}>{value}</strong>
    </div>
  );
}

export function System({ status }: Props) {
  if (!status) {
    return (
      <div className="screen-view system-view">
        <div className="loading-state-card">
          <span className="loader-pulse" />
          <p>INTERROGATING HOST TELEMETRY...</p>
        </div>
      </div>
    );
  }

  const up = formatUptime(
    status.boot_duration.days,
    status.boot_duration.hours,
    status.boot_duration.minutes,
  );

  return (
    <div className="screen-view system-view">
      <div className="system-responsive-grid">
        {/* Machine Specifications */}
        <section className="tactical-card system-card">
          <div className="card-header">
            <span className="card-kicker">HARDWARE PLATFORM</span>
            <h2 className="card-title">HOST ARCHITECTURE</h2>
          </div>

          <div className="kv-list">
            <TacticalKV label="NODE HOSTNAME" value={status.host.hostname} highlight />
            <TacticalKV label="OPERATING SYSTEM" value={status.host.os} />
            <TacticalKV label="LINUX KERNEL" value={status.host.kernel} />
            <TacticalKV label="CPU ARCHITECTURE" value={status.host.machine} />
            <TacticalKV
              label="CORE TOPOLOGY"
              value={`${status.cpu.physical_cores ?? "--"} PHYS • ${status.cpu.logical_cores ?? "--"} THREADS`}
            />
            <TacticalKV
              label="CORE CLOCK FREQUENCY"
              value={
                status.frequency.current_mhz
                  ? `${Math.round(status.frequency.current_mhz)} MHz`
                  : "VARIABLE DYNAMIC"
              }
            />
            <TacticalKV label="TOTAL BOOT UPTIME" value={up} highlight />
            <TacticalKV
              label="POWER INHIBITION"
              value={status.keep_awake ? "INHIBITED (NO SLEEP)" : "STANDBY ALLOWED"}
            />
          </div>
        </section>

        {/* Dynamic Real-time Load */}
        <section className="tactical-card system-card">
          <div className="card-header">
            <span className="card-kicker">SENSOR TELEMETRY</span>
            <h2 className="card-title">RESOURCE UTILIZATION</h2>
          </div>

          <div className="load-meter-group">
            {/* CPU Load */}
            <div className="meter-unit">
              <div className="meter-header">
                <span className="meter-title">PROCESSOR UTILIZATION</span>
                <span className="meter-val">{formatPct(status.cpu.usage_percent)}</span>
              </div>
              <Meter value={status.cpu.usage_percent} tone={meterTone(status.cpu.usage_percent)} />
            </div>

            {/* RAM Load */}
            <div className="meter-unit">
              <div className="meter-header">
                <span className="meter-title">MEMORY (RAM) ALLOCATION</span>
                <span className="meter-val">
                  {status.memory.used_gb} / {status.memory.total_gb} GB ({formatPct(status.memory.percent)})
                </span>
              </div>
              <Meter value={status.memory.percent} tone={meterTone(status.memory.percent)} />
            </div>

            {/* Disk Load */}
            <div className="meter-unit">
              <div className="meter-header">
                <span className="meter-title">PRIMARY ROOT STORAGE</span>
                <span className="meter-val">
                  {status.disk.used_gb} / {status.disk.total_gb} GB ({formatPct(status.disk.percent)})
                </span>
              </div>
              <Meter value={status.disk.percent} tone={meterTone(status.disk.percent)} />
            </div>

            {/* Thermal Sensor */}
            <div className="meter-unit">
              <div className="meter-header">
                <span className="meter-title">CORE DIE TEMPERATURE</span>
                <span className="meter-val">
                  {status.temperature.available ? formatTemp(status.temperature.cpu_temp) : "UNAVAILABLE"}
                </span>
              </div>
              <Meter
                value={status.temperature.cpu_temp}
                tone={tempTone(status.temperature.cpu_temp)}
              />
            </div>

            {/* GPU Sensor if available */}
            {status.gpu.available && (
              <div className="meter-unit">
                <div className="meter-header">
                  <span className="meter-title">
                    GPU DIE: {status.gpu.name ?? "NVIDIA ACCELERATOR"}
                  </span>
                  <span className="meter-val">
                    {Math.round(status.gpu.usage_percent ?? 0)}% • {Math.round(status.gpu.temperature ?? 0)}°C
                  </span>
                </div>
                <Meter
                  value={status.gpu.usage_percent}
                  tone={status.gpu.usage_percent != null ? meterTone(status.gpu.usage_percent) : undefined}
                />
              </div>
            )}

            {/* Battery / Power Supply */}
            <div className="meter-unit">
              <div className="meter-header">
                <span className="meter-title">POWER SOURCE / BATTERY</span>
                <span className="meter-val">
                  {status.battery.available
                    ? `${formatPct(status.battery.percent)} ${status.battery.charging ? "(CHARGING)" : "(DISCHARGING)"}`
                    : "AC MAINS POWER SUPPLY"}
                </span>
              </div>
              {status.battery.available && (
                <Meter
                  value={status.battery.percent}
                  tone={status.battery.charging ? "ok" : meterTone(status.battery.percent ?? 0, true)}
                />
              )}
            </div>

            {/* Network Throughput */}
            <div className="network-rate-box">
              <div className="rate-col">
                <span className="rate-tag">DOWNLINK</span>
                <strong className="rate-num highlight-cyan">{Math.round(status.network.down_kbps)} KB/s</strong>
              </div>
              <div className="rate-col">
                <span className="rate-tag">UPLINK</span>
                <strong className="rate-num highlight-gold">{Math.round(status.network.up_kbps)} KB/s</strong>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
