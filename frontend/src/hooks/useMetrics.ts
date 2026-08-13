import { useState, useEffect, useRef, useCallback } from 'react';
import { Snapshot, MetricKey, MetricHistory } from '../types';

const WS_URL = 'ws://localhost:8000/ws/metrics';
const HISTORY_LENGTH = 60; // keep 60 data points per metric

export interface UseMetricsReturn {
  snapshot: Snapshot | null;
  history: Record<MetricKey, MetricHistory>;
  connected: boolean;
  reconnecting: boolean;
}

export function useMetrics(): UseMetricsReturn {
  const [snapshot, setSnapshot]       = useState<Snapshot | null>(null);
  const [connected, setConnected]     = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [history, setHistory]         = useState<Record<MetricKey, MetricHistory>>({
    heart_rate:       [],
    spo2:             [],
    respiratory_rate: [],
    systolic_bp:      [],
    diastolic_bp:     [],
    body_temp:        [],
    cabin_co2:        [],
    cabin_o2:         [],
    radiation_dose:   [],
    sleep_hours:      [],
    hrv:              [],
  });

  const wsRef         = useRef<WebSocket | null>(null);
  const retryCount    = useRef(0);
  const retryTimeout  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef       = useRef(0);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setReconnecting(false);
      retryCount.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data: Snapshot = JSON.parse(event.data);
        setSnapshot(data);

        const tick = ++tickRef.current;
        setHistory((prev) => {
          const next = { ...prev };
          (Object.keys(data.metrics) as MetricKey[]).forEach((key) => {
            const point = { t: tick, v: data.metrics[key].value };
            const arr = [...prev[key], point];
            next[key] = arr.length > HISTORY_LENGTH ? arr.slice(-HISTORY_LENGTH) : arr;
          });
          return next;
        });
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;

      const delay = Math.min(1000 * 2 ** retryCount.current, 30000);
      retryCount.current++;
      setReconnecting(true);
      retryTimeout.current = setTimeout(connect, delay);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (retryTimeout.current) clearTimeout(retryTimeout.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { snapshot, history, connected, reconnecting };
}
