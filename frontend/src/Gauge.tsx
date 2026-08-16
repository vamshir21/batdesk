function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, start: number, end: number) {
  const a = polar(cx, cy, r, start);
  const b = polar(cx, cy, r, end);
  const large = Math.abs(end - start) > 180 ? 1 : 0;
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y}`;
}

type GaugeProps = {
  label: string;
  value: number | null | undefined;
  max?: number;
  unit?: string;
  tone?: "ok" | "warn" | "hot";
};

export function Gauge({ label, value, max = 100, unit = "%", tone }: GaugeProps) {
  const cx = 100;
  const cy = 108;
  const r = 76;
  const start = -120;
  const sweep = 240;
  const pct = value == null || Number.isNaN(value) ? 0 : Math.max(0, Math.min(1, value / max));
  const angle = start + pct * sweep;
  const needle = polar(cx, cy, r - 10, angle);
  const hub = polar(cx, cy, 8, angle);
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <article className={`gauge${tone ? ` ${tone}` : ""}`}>
      <svg viewBox="0 0 200 150" className="gauge-svg">
        <path className="gauge-track" d={arcPath(cx, cy, r, start, start + sweep)} />
        {pct > 0.004 ? (
          <path className="gauge-value" d={arcPath(cx, cy, r, start, angle)} />
        ) : null}
        {ticks.map((tick) => {
          const deg = start + tick * sweep;
          const outer = polar(cx, cy, r + 2, deg);
          const inner = polar(cx, cy, r - 10, deg);
          return (
            <line
              key={tick}
              className="gauge-tick"
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
            />
          );
        })}
        <line
          className="gauge-needle"
          x1={hub.x}
          y1={hub.y}
          x2={needle.x}
          y2={needle.y}
        />
        <circle className="gauge-hub" cx={cx} cy={cy} r="7" />
      </svg>
      <div className="gauge-read">
        <strong>{value == null || Number.isNaN(value) ? "--" : Math.round(value)}</strong>
        <span>{unit}</span>
      </div>
      <span className="gauge-label">{label}</span>
    </article>
  );
}
