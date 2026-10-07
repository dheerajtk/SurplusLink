import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import DashboardPage   from './pages/DashboardPage';
import LogsPage        from './pages/LogsPage';
import BoardPage       from './pages/BoardPage';
import PostSurplusPage from './pages/PostSurplusPage';
import AdminPage       from './pages/AdminPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Public routes */}
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/board"    element={<BoardPage />} />

            {/* Staff-only routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute roles={['staff', 'admin']}>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/logs" element={
              <ProtectedRoute roles={['staff', 'admin']}>
                <LogsPage />
              </ProtectedRoute>
            } />
            <Route path="/post-surplus" element={
              <ProtectedRoute roles={['staff']}>
                <PostSurplusPage />
              </ProtectedRoute>
            } />

            {/* Admin-only route */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}>
                <AdminPage />
              </ProtectedRoute>
            } />

            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/board" replace />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}
