import type { Settings, Theme } from "./types";

const KEY = "batdesk.settings";

const defaults: Settings = {
  serverUrl: "",
  apiKey: "",
  refreshMs: 2000,
  theme: "dark",
};

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      return { ...defaults };
    }
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      serverUrl: parsed.serverUrl ?? defaults.serverUrl,
      apiKey: parsed.apiKey ?? defaults.apiKey,
      refreshMs: parsed.refreshMs ?? defaults.refreshMs,
      theme: (parsed.theme as Theme) || defaults.theme,
    };
  } catch {
    return { ...defaults };
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(KEY, JSON.stringify(settings));
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
}
