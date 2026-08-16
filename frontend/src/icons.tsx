type IconProps = {
  name:
    | "dash"
    | "controls"
    | "network"
    | "system"
    | "settings"
    | "lock"
    | "sleep"
    | "mute"
    | "unmute"
    | "prev"
    | "play"
    | "next"
    | "power";
};

export function Icon({ name }: IconProps) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  if (name === "dash") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="8" height="8" rx="1.5" />
        <rect x="13" y="3" width="8" height="5" rx="1.5" />
        <rect x="13" y="10" width="8" height="11" rx="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" />
      </svg>
    );
  }
  if (name === "controls") {
    return (
      <svg {...common}>
        <path d="M4 7h16M4 12h10M4 17h13" />
        <circle cx="14" cy="7" r="1.6" fill="currentColor" />
        <circle cx="10" cy="12" r="1.6" fill="currentColor" />
        <circle cx="16" cy="17" r="1.6" fill="currentColor" />
      </svg>
    );
  }
  if (name === "network") {
    return (
      <svg {...common}>
        <path d="M5 16a9 9 0 0 1 14 0" />
        <path d="M8.5 16a5 5 0 0 1 7 0" />
        <circle cx="12" cy="18" r="1.3" fill="currentColor" />
      </svg>
    );
  }
  if (name === "system") {
    return (
      <svg {...common}>
        <rect x="4" y="5" width="16" height="11" rx="2" />
        <path d="M8 20h8M12 16v4" />
      </svg>
    );
  }
  if (name === "settings") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v2.2M12 18.8V21M4.9 6.5l1.6 1.6M17.5 16.9l1.6 1.6M3 12h2.2M18.8 12H21M4.9 17.5l1.6-1.6M17.5 7.1l1.6-1.6" />
      </svg>
    );
  }
  if (name === "lock") {
    return (
      <svg {...common}>
        <rect x="6" y="11" width="12" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
    );
  }
  if (name === "sleep") {
    return (
      <svg {...common}>
        <path d="M15 4a8 8 0 1 0 5 13 7 7 0 0 1-5-13z" />
      </svg>
    );
  }
  if (name === "mute") {
    return (
      <svg {...common}>
        <path d="M4 10v4h3l5 4V6L7 10H4zM16 9l5 6M21 9l-5 6" />
      </svg>
    );
  }
  if (name === "unmute") {
    return (
      <svg {...common}>
        <path d="M4 10v4h3l5 4V6L7 10H4z" />
        <path d="M16 9a4 4 0 0 1 0 6" />
      </svg>
    );
  }
  if (name === "prev") {
    return (
      <svg {...common}>
        <path d="M18 6v12l-8-6 8-6zM6 6v12" />
      </svg>
    );
  }
  if (name === "play") {
    return (
      <svg {...common}>
        <path d="M8 6v12l10-6-10-6z" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (name === "next") {
    return (
      <svg {...common}>
        <path d="M6 6v12l8-6-8-6zM18 6v12" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4v2M12 18v2M6 6l1.5 1.5M16.5 16.5 18 18M4 12h2M18 12h2M6 18l1.5-1.5M16.5 7.5 18 6" />
    </svg>
  );
}
