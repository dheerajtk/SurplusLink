import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';

const EMPTY_ITEM = { name: '', quantity: '', unit: 'portions' };

export default function PostSurplusPage() {
  const { request, loading, error } = useApi();
  const navigate = useNavigate();
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [form,  setForm]  = useState({
    preparedTime: new Date().toISOString().slice(0, 16),
    expiryTime:   '',
  });

  const addItem = () => setItems([...items, { ...EMPTY_ITEM }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      items: items.map((it) => ({ ...it, quantity: Number(it.quantity) })),
      preparedTime: new Date(form.preparedTime).toISOString(),
      expiryTime:   new Date(form.expiryTime).toISOString(),
    };
    const data = await request('/api/surplus', { method: 'POST', body: payload });
    if (data) navigate('/board');
  };

  return (
    <div>
      <div className="page-header">
        <h1>Post Surplus</h1>
        <p>Let pickup partners know what's available.</p>
      </div>

      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>

          {/* Item list */}
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10 }}>Surplus Items</h3>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: '2 1 140px', marginBottom: 0 }}>
                {i === 0 && <label>Item name</label>}
                <input placeholder="e.g. Rajma Rice" required value={item.name}
                  onChange={(e) => updateItem(i, 'name', e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: '1 1 80px', marginBottom: 0 }}>
                {i === 0 && <label>Qty</label>}
                <input type="number" min="1" required value={item.quantity}
                  onChange={(e) => updateItem(i, 'quantity', e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: '1 1 90px', marginBottom: 0 }}>
                {i === 0 && <label>Unit</label>}
                <select value={item.unit} onChange={(e) => updateItem(i, 'unit', e.target.value)}>
                  <option value="portions">portions</option>
                  <option value="kg">kg</option>
                  <option value="litres">litres</option>
                </select>
              </div>
              {items.length > 1 && (
                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(i)}>✕</button>
              )}
            </div>
          ))}
          <button type="button" className="btn btn-sm" onClick={addItem}
            style={{ background: '#fff', border: '1px solid #d0d7de', marginBottom: 20 }}>
            + Add Item
          </button>

          {/* Times */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Prepared at</label>
              <input type="datetime-local" required value={form.preparedTime}
                onChange={(e) => setForm({ ...form, preparedTime: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Claim by (expiry)</label>
              <input type="datetime-local" required value={form.expiryTime}
                onChange={(e) => setForm({ ...form, expiryTime: e.target.value })} />
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Posting…' : 'Post to Board'}
          </button>
        </form>
      </div>
    </div>
  );
}
