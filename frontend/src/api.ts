import { loadSettings } from "./settings";
import type {
  ActionResponse,
  AudioStatus,
  BluetoothDevice,
  BluetoothStatus,
  BrightnessStatus,
  SystemStatus,
  WifiNetwork,
  WifiStatus,
} from "./types";

type Method = "GET" | "POST";

async function request<T>(path: string, method: Method = "GET", body?: unknown): Promise<T> {
  const settings = loadSettings();
  const base = settings.serverUrl.replace(/\/$/, "");
  const headers: Record<string, string> = {};
  if (settings.apiKey) {
    headers["X-API-Key"] = settings.apiKey;
  }
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${base}/api/v1${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  if (!response.ok) {
    let detail = text;
    try {
      const parsed = JSON.parse(text) as { detail?: string };
      if (parsed.detail) {
        detail = parsed.detail;
      }
    } catch {
      /* use raw text */
    }
    throw new Error(detail || `${response.status} ${response.statusText}`);
  }

  return text ? (JSON.parse(text) as T) : ({} as T);
}

async function blob(path: string): Promise<string | null> {
  const settings = loadSettings();
  const base = settings.serverUrl.replace(/\/$/, "");
  const headers: Record<string, string> = {};
  if (settings.apiKey) {
    headers["X-API-Key"] = settings.apiKey;
  }
  const response = await fetch(`${base}/api/v1${path}`, { headers });
  if (!response.ok) {
    return null;
  }
  return URL.createObjectURL(await response.blob());
}

export const api = {
  health: () => request<{ ok: boolean }>("/health"),
  status: () => request<SystemStatus>("/status"),
  lock: () => request<ActionResponse>("/system/lock", "POST"),
  sleep: () => request<ActionResponse>("/system/sleep", "POST"),
  shutdown: () => request<ActionResponse>("/system/shutdown", "POST"),
  restart: () => request<ActionResponse>("/system/restart", "POST"),
  audio: () => request<AudioStatus>("/audio/volume"),
  art: () => blob("/audio/art"),
  setVolume: (volume: number) => request<AudioStatus>("/audio/volume", "POST", { volume }),
  mute: () => request<AudioStatus>("/audio/mute", "POST"),
  unmute: () => request<AudioStatus>("/audio/unmute", "POST"),
  muteMic: () => request<AudioStatus>("/audio/mic/mute", "POST"),
  unmuteMic: () => request<AudioStatus>("/audio/mic/unmute", "POST"),
  setSink: (name: string) => request<AudioStatus>("/audio/sink", "POST", { name }),
  playPause: () => request<ActionResponse>("/audio/play-pause", "POST"),
  next: () => request<ActionResponse>("/audio/next", "POST"),
  previous: () => request<ActionResponse>("/audio/previous", "POST"),
  brightness: () => request<BrightnessStatus>("/display/brightness"),
  setBrightness: (brightness: number) =>
    request<BrightnessStatus>("/display/brightness", "POST", { brightness }),
  keepAwake: (enabled: boolean) =>
    request<ActionResponse>("/system/awake", "POST", { enabled }),
  notify: (title: string, body: string) =>
    request<ActionResponse>("/system/notify", "POST", { title, body }),
  clipboard: (text: string) => request<ActionResponse>("/system/clipboard", "POST", { text }),
  openUrl: (url: string) => request<ActionResponse>("/system/open-url", "POST", { url }),
  launch: (app: string) => request<ActionResponse>("/system/launch", "POST", { app }),
  wifiStatus: () => request<WifiStatus>("/network/wifi/status"),
  wifiNetworks: () => request<WifiNetwork[]>("/network/wifi/networks"),
  wifiOn: () => request<ActionResponse>("/network/wifi/on", "POST"),
  wifiOff: () => request<ActionResponse>("/network/wifi/off", "POST"),
  wifiConnect: (ssid: string, password: string) =>
    request<ActionResponse>("/network/wifi/connect", "POST", {
      ssid,
      password: password || null,
    }),
  wifiDisconnect: () => request<ActionResponse>("/network/wifi/disconnect", "POST"),
  bluetoothStatus: () => request<BluetoothStatus>("/network/bluetooth/status"),
  bluetoothDevices: () => request<BluetoothDevice[]>("/network/bluetooth/devices"),
  bluetoothOn: () => request<ActionResponse>("/network/bluetooth/on", "POST"),
  bluetoothOff: () => request<ActionResponse>("/network/bluetooth/off", "POST"),
  bluetoothConnect: (mac_address: string) =>
    request<ActionResponse>("/network/bluetooth/connect", "POST", { mac_address }),
  bluetoothDisconnect: (mac_address: string) =>
    request<ActionResponse>("/network/bluetooth/disconnect", "POST", { mac_address }),
};
