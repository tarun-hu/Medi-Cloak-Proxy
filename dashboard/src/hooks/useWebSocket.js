import { useEffect, useRef, useState, useCallback } from 'react';

const envApi = import.meta.env.VITE_API_URL;

function getWsUrl() {
  if (envApi) {
    const clean = envApi.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const proto = envApi.startsWith('http://') ? 'ws:' : 'wss:';
    return `${proto}//${clean}/api/ws`;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${window.location.host}/api/ws`;
  }
  return 'ws://localhost:8000/api/ws';
}

const WS_URL = getWsUrl();

export function useWebSocket(onMessage) {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const retriesRef = useRef(0);
  const maxRetries = 10;
  const onMessageRef = useRef(onMessage);

  // Keep ref updated without re-triggering effect
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      retriesRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessageRef.current?.(data);
      } catch (e) {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;

      // Exponential backoff reconnect
      if (retriesRef.current < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retriesRef.current), 30000);
        retriesRef.current++;
        setTimeout(connect, delay);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return { connected };
}
