import { useEffect, useRef } from 'react';
import { API_BASE_URL } from '../api/axiosClient';

const EVENTS_URL = `${API_BASE_URL}/events`;

/**
 * Subscribes to Server-Sent Events (SSE) from the backend for instant live updates.
 * @param {string[]} eventTypes - Event types to listen for (e.g. ['sos:created', 'sos:updated'])
 * @param {Function} onEvent - Callback triggered when a matching event arrives
 */
export function useRealtimeEvents(eventTypes, onEvent) {
  const callbackRef = useRef(onEvent);
  const typesKey = Array.isArray(eventTypes) ? eventTypes.join(',') : '';

  useEffect(() => {
    callbackRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    const source = new EventSource(EVENTS_URL);

    source.onmessage = (msg) => {
      try {
        const parsed = JSON.parse(msg.data);
        if (!parsed || parsed.type === 'connected') return;
        const allowed = typesKey ? typesKey.split(',') : [];
        if (allowed.length === 0 || allowed.includes(parsed.type)) {
          callbackRef.current?.(parsed);
        }
      } catch {
        // Ignore malformed SSE frame
      }
    };

    return () => {
      source.close();
    };
  }, [typesKey]);
}

