import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('sl_token'));
  const [loading, setLoading] = useState(true);

  // On first load, validate stored token by fetching /api/auth/me
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(({ user }) => setUser(user))
      .catch(() => {
        // Token invalid / expired — clear it
        localStorage.removeItem('sl_token');
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = ({ token: t, user: u }) => {
    localStorage.setItem('sl_token', t);
    setToken(t);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('sl_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — cleaner than calling useContext everywhere
export function useAuth() {
  return useContext(AuthContext);
}
