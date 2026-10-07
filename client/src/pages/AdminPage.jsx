import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

export default function AdminPage() {
  const { request, loading } = useApi();
  const [metrics,  setMetrics]  = useState(null);
  const [partners, setPartners] = useState([]);
  const [tab,      setTab]      = useState('metrics');

  useEffect(() => {
    request('/api/admin/metrics').then((d) => d && setMetrics(d));
    request('/api/admin/partners').then((d) => d?.partners && setPartners(d.partners));
  }, []);

  const handleApprove = async (id) => {
    const data = await request(`/api/admin/partners/${id}/approve`, { method: 'PATCH' });
    if (data) setPartners((prev) => prev.map((p) => p._id === id ? { ...p, approved: true } : p));
  };

  return (
    <div>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Platform metrics and partner management.</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2" style={{ marginBottom: 20 }}>
        {['metrics', 'partners'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`btn btn-sm ${tab === t ? 'btn-secondary' : ''}`}
            style={tab !== t ? { background: '#fff', border: '1px solid #d0d7de', color: '#1f2328' } : {}}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Metrics tab ─────────────────────────────────────────────────── */}
      {tab === 'metrics' && (
        <>
          {loading && <div className="spinner" />}
          {metrics && (
            <>
              <div className="stat-grid">
                <div className="stat-card">
                  <div className="stat-card__value">{metrics.meals.wastePercent}%</div>
                  <div className="stat-card__label">Waste rate (30 days)</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card__value">{metrics.surplus.pickupRate}%</div>
                  <div className="stat-card__label">Pickup rate</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card__value">
                    {metrics.forecast.maePercent != null ? `${metrics.forecast.maePercent}%` : '—'}
                  </div>
                  <div className="stat-card__label">Forecast error (MAE %)</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card__value">{metrics.surplus.pickedUp}</div>
                  <div className="stat-card__label">Pickups completed</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card__value">{metrics.meals.totalLeftover}</div>
                  <div className="stat-card__label">Total leftover portions</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card__value">{metrics.users.partnerCount}</div>
                  <div className="stat-card__label">Registered partners</div>
                </div>
              </div>

              <div className="card">
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10 }}>
                  30-Day Summary
                </h3>
                <div className="table-wrap">
                  <table>
                    <tbody>
                      <tr><td>Prepared</td><td><strong>{metrics.meals.totalPrepared}</strong> portions</td></tr>
                      <tr><td>Sold</td><td><strong>{metrics.meals.totalSold}</strong> portions</td></tr>
                      <tr><td>Leftover</td><td><strong>{metrics.meals.totalLeftover}</strong> portions</td></tr>
                      <tr><td>Surplus posts</td><td><strong>{metrics.surplus.totalPosts}</strong></td></tr>
                      <tr><td>Confirmed pickups</td><td><strong>{metrics.surplus.pickedUp}</strong></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ── Partners tab ────────────────────────────────────────────────── */}
      {tab === 'partners' && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Organisation</th><th>Type</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => (
                  <tr key={p._id}>
                    <td>{p.userId?.name}</td>
                    <td>{p.userId?.email}</td>
                    <td>{p.orgName}</td>
                    <td>{p.type?.replace('_', ' ')}</td>
                    <td>
                      <span className={`badge ${p.approved ? 'badge-picked_up' : 'badge-available'}`}>
                        {p.approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      {!p.approved && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleApprove(p._id)}>
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {partners.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: '#57606a' }}>No partners yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
