import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DashboardPage() {
  const { user } = useAuth();
  const { request, loading, error } = useApi();

  const [menuItem,   setMenuItem]   = useState('');
  const [attendance, setAttendance] = useState('');
  const [forecast,   setForecast]   = useState(null);
  const [todayLogs,  setTodayLogs]  = useState([]);

  const todayStr = new Date().toISOString().split('T')[0];
  const weekday  = WEEKDAYS[new Date().getDay()];

  useEffect(() => {
    // Load today's logs on mount
    request(`/api/meal-logs?from=${todayStr}&to=${todayStr}`).then((d) => {
      if (d?.logs) setTodayLogs(d.logs);
    });
  }, [todayStr]);

  const handleForecast = async (e) => {
    e.preventDefault();
    const data = await request(
      `/api/forecast?menuItem=${encodeURIComponent(menuItem)}&attendance=${attendance}&date=${todayStr}`
    );
    if (data) setForecast(data);
  };

  const totalLeftover = todayLogs.reduce((s, l) => s + (l.leftoverQty || 0), 0);

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard — {weekday}, {new Date().toLocaleDateString()}</h1>
        <p>Welcome, {user?.name}. Here's today's overview.</p>
      </div>

      {/* Today's summary */}
      {todayLogs.length > 0 && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card__value">{todayLogs.length}</div>
            <div className="stat-card__label">Items logged</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{todayLogs.reduce((s, l) => s + l.preparedQty, 0)}</div>
            <div className="stat-card__label">Total prepared</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{todayLogs.reduce((s, l) => s + l.soldQty, 0)}</div>
            <div className="stat-card__label">Total sold</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value" style={{ color: totalLeftover > 10 ? '#d1242f' : '#2da44e' }}>
              {totalLeftover}
            </div>
            <div className="stat-card__label">Leftover portions</div>
          </div>
        </div>
      )}

      {/* Surplus prompt */}
      {totalLeftover >= 5 && (
        <div className="alert alert-info">
          ⚡ You have <strong>{totalLeftover} leftover portions</strong> today.
          Consider <Link to="/post-surplus">posting them on the surplus board</Link>.
        </div>
      )}

      {/* Forecast widget */}
      <div className="card">
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>
          Get Portion Forecast
        </h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleForecast} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: '1 1 180px', marginBottom: 0 }}>
            <label>Menu Item</label>
            <input value={menuItem} onChange={(e) => setMenuItem(e.target.value)}
              placeholder="e.g. Rajma Rice" required />
          </div>
          <div className="form-group" style={{ flex: '1 1 120px', marginBottom: 0 }}>
            <label>Expected Attendance</label>
            <input type="number" min="1" value={attendance}
              onChange={(e) => setAttendance(e.target.value)} required />
          </div>
          <button className="btn btn-primary" disabled={loading}>
            {loading ? '…' : 'Forecast'}
          </button>
        </form>

        {forecast && (
          <div className="alert alert-success mt-2">
            📊 Recommended: <strong>{forecast.recommendedPortions} portions</strong>
            &nbsp;of <em>{forecast.menuItem}</em>
            &nbsp;(based on {forecast.historicalPoints} past entries)
          </div>
        )}
      </div>

      <div className="mt-2 flex gap-2">
        <Link to="/logs" className="btn btn-secondary btn-sm">View All Logs</Link>
        <Link to="/post-surplus" className="btn btn-primary btn-sm">Post Surplus</Link>
      </div>
    </div>
  );
}
