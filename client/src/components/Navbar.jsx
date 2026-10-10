import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/board'); };

  return (
    <nav className="navbar">
      <Link to="/board" className="navbar__brand">🥗 SurplusLink</Link>
      <ul className="navbar__links">
        <li><Link to="/board">Board</Link></li>

        {user?.role === 'staff' && <>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/logs">Logs</Link></li>
          <li><Link to="/post-surplus">Post Surplus</Link></li>
        </>}

        {user?.role === 'admin' && <>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/logs">Logs</Link></li>
          <li><Link to="/admin">Admin</Link></li>
        </>}

        {user ? (
          <li>
            <button className="btn-logout" onClick={handleLogout}>
              {user.name.split(' ')[0]} · Logout
            </button>
          </li>
        ) : (<>
          <li><Link to="/register">Register</Link></li>
          <li><Link to="/login">Login</Link></li>
        </>)}
      </ul>
    </nav>
  );
}
