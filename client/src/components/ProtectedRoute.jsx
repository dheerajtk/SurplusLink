import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute wraps any page that requires login (and optionally a role).
 * If the user is not logged in → redirect to /login.
 * If the user's role is not in `roles` → redirect to /board.
 */
export default function ProtectedRoute({ children, roles = [] }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="spinner" />;
  if (!user)   return <Navigate to="/login" replace />;
  if (roles.length && !roles.includes(user.role)) return <Navigate to="/board" replace />;

  return children;
}
