export function formatUptime(days: number, hours: number, minutes: number): string {
  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function formatPct(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }
  return `${Math.round(value)}%`;
}

export function formatTemp(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }
  return `${Math.round(value)}°`;
}

export function meterTone(value: number, invert = false): "ok" | "warn" | "hot" {
  if (invert) {
    if (value <= 20) {
      return "hot";
    }
    if (value <= 40) {
      return "warn";
    }
    return "ok";
  }
  if (value >= 90) {
    return "hot";
  }
  if (value >= 75) {
    return "warn";
  }
  return "ok";
}

export function tempTone(value: number | null | undefined): "ok" | "warn" | "hot" | undefined {
  if (value == null) {
    return undefined;
  }
  if (value >= 85) {
    return "hot";
  }
  if (value >= 70) {
    return "warn";
  }
  return "ok";
}
