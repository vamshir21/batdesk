type MeterProps = {
  value: number | null | undefined;
  tone?: "ok" | "warn" | "hot";
  showTicks?: boolean;
};

export function Meter({ value, tone, showTicks = true }: MeterProps) {
  const percent = Math.max(0, Math.min(100, value ?? 0));
  const toneClass = tone ? ` tone-${tone}` : " tone-gold";

  return (
    <div className={`tactical-meter${toneClass}`}>
      <div className="meter-track">
        <div
          className="meter-fill"
          style={{ width: `${percent}%` }}
        />
        {showTicks && (
          <div className="meter-ticks" aria-hidden="true">
            <span style={{ left: "25%" }} />
            <span style={{ left: "50%" }} />
            <span style={{ left: "75%" }} />
          </div>
        )}
      </div>
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
    <button
      type="button"
      className={`tactical-switch${on ? " is-on" : " is-off"}`}
      onClick={onClick}
      aria-pressed={on}
    >
      <span className="switch-led" />
      <span className="switch-toggle">
        <span className="switch-knob" />
      </span>
      <span className="switch-label">{label}</span>
    </button>
  );
}

type SignalProps = {
  percent: number;
};

export function Signal({ percent }: SignalProps) {
  const bars = percent > 75 ? 4 : percent > 50 ? 3 : percent > 25 ? 2 : 1;
  return (
    <div className="tactical-signal" aria-label={`Signal strength ${percent}%`}>
      {[1, 2, 3, 4].map((level) => (
        <span
          key={level}
          className={`signal-bar bar-${level}${level <= bars ? " active" : ""}`}
        />
      ))}
    </div>
  );
}
