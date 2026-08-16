type MeterProps = {
  value: number | null | undefined;
  tone?: "ok" | "warn" | "hot";
};

export function Meter({ value, tone }: MeterProps) {
  const width = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div className="meter">
      <div className={`meter-fill${tone ? ` ${tone}` : ""}`} style={{ width: `${width}%` }} />
    </div>
  );
}

type SwitchProps = {
  on: boolean;
  onClick: () => void;
  label: string;
};

export function Switch({ on, onClick, label }: SwitchProps) {
  return (
    <button type="button" className={`switch${on ? " on" : ""}`} onClick={onClick} aria-pressed={on}>
      <span className="switch-knob" />
      <span className="switch-text">{label}</span>
    </button>
  );
}

type SignalProps = {
  percent: number;
};

export function Signal({ percent }: SignalProps) {
  const bars = percent > 75 ? 4 : percent > 50 ? 3 : percent > 25 ? 2 : 1;
  return (
    <span className="signal" aria-hidden="true">
      {[1, 2, 3, 4].map((level) => (
        <i key={level} className={level <= bars ? "on" : ""} />
      ))}
    </span>
  );
}
