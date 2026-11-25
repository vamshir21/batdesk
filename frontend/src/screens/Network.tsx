import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { Signal, Switch } from "../ui";
import { Icon } from "../icons";
import type { BluetoothDevice, BluetoothStatus, WifiNetwork, WifiStatus } from "../types";

type Props = {
  onError: (message: string) => void;
};

export function Network({ onError }: Props) {
  const [wifi, setWifi] = useState<WifiStatus | null>(null);
  const [networks, setNetworks] = useState<WifiNetwork[]>([]);
  const [bluetooth, setBluetooth] = useState<BluetoothStatus | null>(null);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [scanning, setScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<"wifi" | "bt">("wifi");

  const refresh = useCallback(async () => {
    setScanning(true);
    try {
      const [wifiStatus, wifiList, btStatus, btDevices] = await Promise.all([
        api.wifiStatus(),
        api.wifiNetworks(),
        api.bluetoothStatus(),
        api.bluetoothDevices(),
      ]);
      setWifi(wifiStatus);
      setNetworks(wifiList);
      setBluetooth(btStatus);
      setDevices(btDevices);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Network refresh failed");
    } finally {
      setScanning(false);
    }
  }, [onError]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!ssid && wifi?.ssid) {
      setSsid(wifi.ssid);
    }
  }, [ssid, wifi]);

  async function run(action: () => Promise<unknown>) {
    try {
      await action();
      await refresh();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Request failed");
    }
  }

  return (
    <div className="screen-view network-view">
      {/* Top Action Bar */}
      <div className="network-action-bar">
        <div className="bar-label">
          <span className="dot" />
          <span>WIRELESS TELEMETRY MATRIX</span>
        </div>
        <button
          type="button"
          className={`tactical-btn refresh-btn${scanning ? " is-spinning" : ""}`}
          onClick={() => void refresh()}
          disabled={scanning}
        >
          <Icon name="refresh" />
          <span>{scanning ? "SCANNING..." : "REFRESH"}</span>
        </button>
      </div>

      {/* Mobile Segmented Tab Switcher (Visible on narrow mobile viewports) */}
      <div className="network-mobile-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "wifi"}
          className={`net-tab-btn${activeTab === "wifi" ? " is-active" : ""}`}
          onClick={() => setActiveTab("wifi")}
        >
          <Icon name="network" />
          <span>WI-FI ({networks.length})</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "bt"}
          className={`net-tab-btn${activeTab === "bt" ? " is-active" : ""}`}
          onClick={() => setActiveTab("bt")}
        >
          <Icon name="controls" />
          <span>BLUETOOTH ({devices.length})</span>
        </button>
      </div>

      <div className={`network-responsive-grid show-${activeTab}`}>
        {/* Wi-Fi Card */}
        <section className="tactical-card network-card wifi-section">
          <div className="card-header">
            <div>
              <span className="card-kicker">802.11 WIRELESS RADIO</span>
              <h2 className="card-title">
                {wifi?.connected ? wifi.ssid ?? "CONNECTED" : "DISCONNECTED"}
              </h2>
            </div>
            <Switch
              on={Boolean(wifi?.enabled)}
              label={wifi?.enabled ? "WIFI ON" : "WIFI OFF"}
              onClick={() => void run(wifi?.enabled ? api.wifiOff : api.wifiOn)}
            />
          </div>

          <div className="network-list-wrapper">
            <span className="list-heading">DETECTED ACCESS POINTS ({networks.length})</span>
            <div className="network-scroll-list">
              {networks.length === 0 && (
                <p className="empty-notice">
                  {scanning ? "Sweeping beacon frames..." : "No access points found. Tap Refresh."}
                </p>
              )}
              {networks.map((network) => (
                <button
                  type="button"
                  key={network.ssid}
                  className={`network-item-row${ssid === network.ssid ? " is-selected" : ""}`}
                  onClick={() => setSsid(network.ssid)}
                >
                  <div className="network-info">
                    <span className="network-ssid">{network.ssid}</span>
                    <span className="network-security">{network.security || "Open Network"}</span>
                  </div>
                  <Signal percent={network.signal} />
                </button>
              ))}
            </div>
          </div>

          {/* Connect / Auth form */}
          <div className="network-auth-form">
            <div className="input-group">
              <label htmlFor="wifi-ssid">TARGET SSID</label>
              <input
                id="wifi-ssid"
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                placeholder="Access Point Name"
                className="tactical-input"
              />
            </div>

            <div className="input-group">
              <label htmlFor="wifi-pwd">WPA PASSPHRASE</label>
              <input
                id="wifi-pwd"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="tactical-input"
              />
            </div>

            <div className="button-pair-grid">
              <button
                type="button"
                className="tactical-btn is-active"
                onClick={() => void run(() => api.wifiConnect(ssid, password))}
              >
                CONNECT
              </button>
              <button
                type="button"
                className="tactical-btn danger-btn"
                onClick={() => void run(api.wifiDisconnect)}
              >
                DISCONNECT
              </button>
            </div>
          </div>
        </section>

        {/* Bluetooth Card */}
        <section className="tactical-card network-card bt-section">
          <div className="card-header">
            <div>
              <span className="card-kicker">BLUEZ ADAPTER MATRIX</span>
              <h2 className="card-title">
                {devices.find((d) => d.connected)?.name ?? "NO DEVICE CONNECTED"}
              </h2>
            </div>
            <Switch
              on={Boolean(bluetooth?.enabled)}
              label={bluetooth?.enabled ? "BT ON" : "BT OFF"}
              onClick={() => void run(bluetooth?.enabled ? api.bluetoothOff : api.bluetoothOn)}
            />
          </div>

          <div className="network-list-wrapper">
            <span className="list-heading">PAIRED PERIPHERALS ({devices.length})</span>
            <div className="network-scroll-list">
              {devices.length === 0 && (
                <p className="empty-notice">No paired Bluetooth devices detected on the PC.</p>
              )}
              {devices.map((device) => (
                <button
                  type="button"
                  key={device.mac_address}
                  className={`network-item-row${device.connected ? " is-connected" : ""}`}
                  onClick={() =>
                    void run(() =>
                      device.connected
                        ? api.bluetoothDisconnect(device.mac_address)
                        : api.bluetoothConnect(device.mac_address),
                    )
                  }
                >
                  <div className="network-info">
                    <span className="network-ssid">{device.name}</span>
                    <span className="network-mac">{device.mac_address}</span>
                  </div>
                  <span className={`status-pill ${device.connected ? "connected" : "idle"}`}>
                    {device.connected ? "CONNECTED" : "TAP TO CONNECT"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
