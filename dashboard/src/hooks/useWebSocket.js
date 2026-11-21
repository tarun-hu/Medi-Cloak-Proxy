import { useEffect, useRef, useState, useCallback } from 'react';

export function getWsUrl() {
  // 1. User manual override stored in localStorage
  if (typeof window !== 'undefined' && localStorage.getItem('medicloak_api_url')) {
    const clean = localStorage.getItem('medicloak_api_url').replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/\/api$/, '');
    return `wss://${clean}/api/ws`;
  }
  // 2. Build-time injected VITE_API_URL
  const envApi = import.meta.env.VITE_API_URL;
  if (envApi && typeof envApi === 'string' && envApi !== 'undefined' && !envApi.includes('localhost')) {
    const clean = envApi.replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/\/api$/, '');
    const proto = envApi.startsWith('http://') ? 'ws:' : 'wss:';
    return `${proto}//${clean}/api/ws`;
  }
  // 3. Dynamic cloud derivation on Render (*.onrender.com)
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    const backendHost = window.location.hostname.replace('medicloak-dashboard', 'medicloak-backend');
    return `wss://${backendHost}/api/ws`;
  }
  // 4. Default to local development
  return 'ws://localhost:8000/api/ws';
}

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

    try {
      const targetWs = getWsUrl();
      const ws = new WebSocket(targetWs);
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
          const delay = Math.min(1000 * Math.pow(2, retriesRef.current), 15000);
          retriesRef.current++;
          setTimeout(connect, delay);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (err) {
      console.warn('WebSocket connection error:', err);
    }
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
