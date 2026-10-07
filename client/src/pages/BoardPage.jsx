import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import SurplusCard from '../components/SurplusCard';

export default function BoardPage() {
  const { user } = useAuth();
  const { request, loading } = useApi();
  const [posts,  setPosts]  = useState([]);
  const [filter, setFilter] = useState('available');

  const loadPosts = useCallback(() => {
    request(`/api/surplus?status=${filter}`).then((d) => d?.posts && setPosts(d.posts));
  }, [filter]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  // Auto-refresh every 30 seconds so partners see new posts without reloading
  useEffect(() => {
    const id = setInterval(loadPosts, 30_000);
    return () => clearInterval(id);
  }, [loadPosts]);

  const handleClaim = async (id) => {
    const data = await request(`/api/surplus/${id}/claim`, { method: 'PATCH' });
    if (data) loadPosts();
  };

  const handleConfirm = async (id) => {
    const data = await request(`/api/surplus/${id}/confirm`, { method: 'PATCH' });
    if (data) loadPosts();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Surplus Pickup Board</h1>
        <p>Available food from nearby cafeterias. Claim to pick up.</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2" style={{ marginBottom: 18 }}>
        {['available', 'claimed', 'picked_up'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`btn btn-sm ${filter === s ? 'btn-primary' : ''}`}
            style={filter !== s ? { background: '#fff', border: '1px solid #d0d7de', color: '#1f2328' } : {}}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading && <div className="spinner" />}

      {!loading && posts.length === 0 && (
        <div className="alert alert-info">
          {filter === 'available'
            ? 'No surplus posted right now. Check back later!'
            : `No ${filter.replace('_', ' ')} posts.`}
        </div>
      )}

      {posts.map((post) => (
        <SurplusCard
          key={post._id}
          post={post}
          currentUser={user}
          onClaim={handleClaim}
          onConfirm={handleConfirm}
        />
      ))}

      {!user && (
        <p className="text-sm text-muted mt-2" style={{ textAlign: 'center' }}>
          <a href="/login">Sign in as a pickup partner</a> to claim surplus.
        </p>
      )}
    </div>
  );
}
