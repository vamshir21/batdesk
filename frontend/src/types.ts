export type Screen = "dash" | "controls" | "network" | "system" | "settings";
export type Theme = "dark" | "dim";

export type Host = {
  hostname: string;
  os: string;
  kernel: string;
  machine: string;
};

export type Gpu = {
  available: boolean;
  name: string | null;
  usage_percent: number | null;
  temperature: number | null;
  memory_used_gb: number | null;
  memory_total_gb: number | null;
};

export type NetworkRate = {
  down_kbps: number;
  up_kbps: number;
};

export type SystemStatus = {
  host: Host;
  cpu: {
    usage_percent: number;
    physical_cores: number | null;
    logical_cores: number | null;
  };
  memory: {
    total_gb: number;
    used_gb: number;
    free_gb: number;
    available_gb: number;
    percent: number;
  };
  disk: {
    total_gb: number;
    used_gb: number;
    free_gb: number;
    percent: number;
  };
  battery: {
    available: boolean;
    percent: number | null;
    charging: boolean | null;
  };
  frequency: {
    current_mhz: number | null;
    min_mhz: number | null;
    max_mhz: number | null;
  };
  temperature: {
    available: boolean;
    cpu_temp: number | null;
    cpu_max_temp: number | null;
    cpu_critical_temp: number | null;
  };
  boot_duration: {
    days: number;
    hours: number;
    minutes: number;
  };
  gpu: Gpu;
  network: NetworkRate;
  keep_awake: boolean;
};

export type NowPlaying = {
  available: boolean;
  playing: boolean;
  status: string;
  player: string | null;
  title: string | null;
  artist: string | null;
  album: string | null;
  has_art: boolean;
};

export type AudioSink = {
  name: string;
  description: string;
  default: boolean;
};

export type AudioStatus = {
  volume: number;
  muted: boolean;
  mic_muted: boolean;
  now_playing: NowPlaying;
  sinks: AudioSink[];
};

export type BrightnessStatus = {
  brightness: number;
};

export type ActionResponse = {
  success: boolean;
  message: string;
};

export type WifiStatus = {
  enabled: boolean;
  connected: boolean;
  ssid: string | null;
  signal: number | null;
};

export type WifiNetwork = {
  ssid: string;
  signal: number;
  security: string;
};

export type BluetoothStatus = {
  enabled: boolean;
  discovering: boolean;
};

export type BluetoothDevice = {
  mac_address: string;
  name: string;
  connected: boolean;
};

export type Settings = {
  serverUrl: string;
  apiKey: string;
  refreshMs: number;
  theme: Theme;
};
