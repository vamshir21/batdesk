type GaugeProps = {
  label: string;
  value: number | null | undefined;
  max?: number;
  unit?: string;
  tone?: "ok" | "warn" | "hot";
  subtitle?: string;
};

export function Gauge({
  label,
  value,
  max = 100,
  unit = "%",
  tone,
  subtitle,
}: GaugeProps) {
  const hasValue = value != null && !Number.isNaN(value);
  const numericVal = hasValue ? (value as number) : 0;
  const pct = Math.max(0, Math.min(1, numericVal / max));

  // 240-degree arc from 150deg to 390deg (cx=80, cy=74, r=54)
  // Arc length = 2 * PI * 54 * (240 / 360) = 226.19
  const arcLength = 226.19;
  const strokeOffset = arcLength * (1 - pct);

  // SVG path for 240-deg arc: starts at 150 deg, ends at 390 deg
  const arcPath = "M 33.23 101.00 A 54 54 0 1 1 126.77 101.00";

  let statusText = "OK";
  if (!hasValue) {
    statusText = "OFF";
  } else if (tone === "hot") {
    statusText = "CRIT";
  } else if (tone === "warn") {
    statusText = "WARN";
  }

  const toneClass = tone ? ` tone-${tone}` : " tone-default";

  return (
    <div className={`modern-dial-card${toneClass}`}>
      <div className="dial-header">
        <span className="dial-label">{label}</span>
        <span className="dial-status-tag">{statusText}</span>
      </div>

      <div className="dial-visual-wrap">
        <svg viewBox="0 0 160 116" className="dial-svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id={`glow-${label}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track */}
          <path
            className="dial-track-bg"
            d={arcPath}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Active Value Arc */}
          <path
            className="dial-track-fill"
            d={arcPath}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={hasValue ? strokeOffset : arcLength}
            filter={`url(#glow-${label})`}
          />
        </svg>

        {/* Center Digital Telemetry Display */}
        <div className="dial-center-telemetry">
          <div className="dial-value-row">
            <span className="dial-num">{hasValue ? Math.round(numericVal) : "--"}</span>
            <span className="dial-unit">{unit}</span>
          </div>
          {subtitle && <span className="dial-sub-info">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
}
