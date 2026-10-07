import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const ORG_TYPES = ['charity', 'shelter', 'community_fridge', 'student_club', 'other'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', orgName: '', type: 'charity', phone: '',
  });
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: 'partner' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div style={{ maxWidth: 440, margin: '60px auto' }}>
      <div className="card">
        <div className="alert alert-success">
          ✅ Registration submitted! An admin will approve your account shortly.
          You'll be able to log in once approved.
        </div>
        <Link to="/login" className="btn btn-secondary" style={{ display: 'block', textAlign: 'center' }}>
          Back to Login
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 440, margin: '40px auto' }}>
      <div className="card">
        <div className="page-header">
          <h1>Register as Pickup Partner</h1>
          <p>Charities, shelters, community fridges, student clubs</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {[['name','Name','text'],['email','Email','email'],['password','Password','password'],
            ['orgName','Organisation Name','text'],['phone','Phone (optional)','tel']].map(([key, label, type]) => (
            <div className="form-group" key={key}>
              <label>{label}</label>
              <input type={type} value={form[key]} required={key !== 'phone'}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
            </div>
          ))}
          <div className="form-group">
            <label>Organisation Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {ORG_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Submitting…' : 'Submit Registration'}
          </button>
        </form>
        <p className="text-sm text-muted mt-2" style={{ textAlign: 'center' }}>
          Already approved? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
