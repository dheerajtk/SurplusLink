import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const BASE = import.meta.env.VITE_API_URL || '';

/**
 * useApi — centralised fetch wrapper.
 *
 * WHY: avoids repeating the Authorization header + JSON parsing
 * in every component. Single place to add global error handling.
 *
 * Usage:
 *   const { request, loading, error } = useApi();
 *   const data = await request('/api/meal-logs', { method: 'POST', body: { ... } });
 */
export function useApi() {
  const { token, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const request = useCallback(
    async (path, options = {}) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BASE}${path}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
        });

        if (res.status === 401) { logout(); return null; }

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Request failed');
        return data;
      } catch (err) {
        setError(err.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, logout]
  );

  return { request, loading, error, setError };
}
