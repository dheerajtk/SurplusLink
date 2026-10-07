import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

export default function LogsPage() {
  const { request, loading, error } = useApi();
  const [logs,  setLogs]  = useState([]);
  const [form,  setForm]  = useState({
    date: new Date().toISOString().split('T')[0],
    menuItem: '', expectedAttendance: '', preparedQty: '', soldQty: '',
    forecastedQty: '', unit: 'portions',
  });
  const [editId, setEditId] = useState(null);
  const [editSold, setEditSold] = useState('');
  const [success, setSuccess] = useState('');

  const loadLogs = () => request('/api/meal-logs').then((d) => d?.logs && setLogs(d.logs));

  useEffect(() => { loadLogs(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const data = await request('/api/meal-logs', { method: 'POST', body: form });
    if (data) { setSuccess('Log saved!'); setForm({ ...form, menuItem: '', preparedQty: '', soldQty: '', forecastedQty: '' }); loadLogs(); }
  };

  const handleUpdate = async (id) => {
    const data = await request(`/api/meal-logs/${id}`, { method: 'PATCH', body: { soldQty: Number(editSold) } });
    if (data) { setEditId(null); loadLogs(); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Meal Logs</h1>
        <p>Record and update daily meal data.</p>
      </div>

      {/* Add log form */}
      <div className="card">
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>Add Today's Log</h2>
        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 10 }}>
            {[
              ['date',               'Date',            'date'],
              ['menuItem',           'Menu Item',        'text'],
              ['expectedAttendance', 'Expected People',  'number'],
              ['preparedQty',        'Prepared Qty',     'number'],
              ['soldQty',            'Sold Qty',         'number'],
              ['forecastedQty',      'Forecasted Qty',   'number'],
            ].map(([key, label, type]) => (
              <div className="form-group" key={key} style={{ marginBottom: 0 }}>
                <label>{label}</label>
                <input type={type} value={form[key]} required={key !== 'forecastedQty'}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Unit</label>
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                <option value="portions">portions</option>
                <option value="kg">kg</option>
                <option value="litres">litres</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary mt-2" disabled={loading}>
            {loading ? 'Saving…' : 'Save Log'}
          </button>
        </form>
      </div>

      {/* Logs table */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th><th>Item</th><th>Prepared</th><th>Sold</th>
                <th>Leftover</th><th>Forecasted</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>{new Date(log.date).toLocaleDateString()}</td>
                  <td>{log.menuItem}</td>
                  <td>{log.preparedQty}</td>
                  <td>
                    {editId === log._id ? (
                      <input type="number" value={editSold} onChange={(e) => setEditSold(e.target.value)}
                        style={{ width: 70, padding: '3px 6px' }} />
                    ) : log.soldQty}
                  </td>
                  <td style={{ color: log.leftoverQty > 10 ? '#d1242f' : 'inherit' }}>
                    {log.leftoverQty}
                  </td>
                  <td>{log.forecastedQty ?? '—'}</td>
                  <td>
                    {editId === log._id ? (
                      <button className="btn btn-primary btn-sm" onClick={() => handleUpdate(log._id)}>Save</button>
                    ) : (
                      <button className="btn btn-secondary btn-sm"
                        onClick={() => { setEditId(log._id); setEditSold(log.soldQty); }}>
                        Update Sold
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && logs.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#57606a' }}>No logs yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
