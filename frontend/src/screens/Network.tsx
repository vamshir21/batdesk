import { useCallback, useEffect, useState } from "react";

import { api } from "../api";
import { Signal, Switch } from "../ui";
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

  const refresh = useCallback(async () => {
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
    <div className="network-grid">
      <section className="panel network-col">
        <div className="panel-head">
          <div>
            <p className="panel-kicker">Wi-Fi</p>
            <h2>{wifi?.connected ? wifi.ssid ?? "Connected" : "Not connected"}</h2>
          </div>
          <Switch
            on={Boolean(wifi?.enabled)}
            label={wifi?.enabled ? "On" : "Off"}
            onClick={() => void run(wifi?.enabled ? api.wifiOff : api.wifiOn)}
          />
        </div>
        <div className="list grow">
          {networks.length === 0 && <p className="empty">No networks yet. Scan again.</p>}
          {networks.map((network) => (
            <button
              type="button"
              key={network.ssid}
              className={`list-item${ssid === network.ssid ? " selected" : ""}`}
              onClick={() => setSsid(network.ssid)}
            >
              <span className="list-main">
                <span>{network.ssid}</span>
                <span className="muted tiny">{network.security || "Open"}</span>
              </span>
              <Signal percent={network.signal} />
            </button>
          ))}
        </div>
        <div className="form-row">
          <input
            value={ssid}
            onChange={(event) => setSsid(event.target.value)}
            placeholder="Network"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
          />
        </div>
        <div className="btn-grid compact">
          <button
            type="button"
            className="quick"
            onClick={() => void run(() => api.wifiConnect(ssid, password))}
          >
            Connect
          </button>
          <button type="button" className="quick ghost" onClick={() => void run(api.wifiDisconnect)}>
            Drop
          </button>
        </div>
      </section>

      <section className="panel network-col">
        <div className="panel-head">
          <div>
            <p className="panel-kicker">Bluetooth</p>
            <h2>{devices.find((device) => device.connected)?.name ?? "No device"}</h2>
          </div>
          <Switch
            on={Boolean(bluetooth?.enabled)}
            label={bluetooth?.enabled ? "On" : "Off"}
            onClick={() => void run(bluetooth?.enabled ? api.bluetoothOff : api.bluetoothOn)}
          />
        </div>
        <div className="list grow">
          {devices.length === 0 && <p className="empty">No paired devices.</p>}
          {devices.map((device) => (
            <button
              type="button"
              key={device.mac_address}
              className={`list-item${device.connected ? " selected" : ""}`}
              onClick={() =>
                void run(() =>
                  device.connected
                    ? api.bluetoothDisconnect(device.mac_address)
                    : api.bluetoothConnect(device.mac_address),
                )
              }
            >
              <span>{device.name}</span>
              <span className="muted tiny">{device.connected ? "Connected" : "Tap"}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
