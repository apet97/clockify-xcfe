import React from 'react';
import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { useAuth } from './providers/AuthProvider.js';
import LoginPage from './pages/LoginPage.js';
import DashboardPage from './pages/DashboardPage.js';
import FormulasPage from './pages/FormulasPage.js';
import DictionariesPage from './pages/DictionariesPage.js';
import BackfillPage from './pages/BackfillPage.js';
import AuditLogPage from './pages/AuditLogPage.js';
import SettingsPage from './pages/SettingsPage.js';

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/formulas', label: 'Formulas' },
  { to: '/dictionaries', label: 'Dictionaries' },
  { to: '/backfill', label: 'Backfill' },
  { to: '/audit', label: 'Audit Log' },
  { to: '/settings', label: 'Settings' }
] as const;

const App: React.FC = () => {
  const { token, logout } = useAuth();

  if (!token) {
    return <LoginPage />;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1 className="app-title">xCFE Admin</h1>
          <p className="app-subtitle">Formula governance for Clockify custom fields</p>
        </div>
        <button className="ghost" type="button" onClick={logout}>
          Sign out
        </button>
      </header>
      <nav className="app-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/formulas" element={<FormulasPage />} />
          <Route path="/dictionaries" element={<DictionariesPage />} />
          <Route path="/backfill" element={<BackfillPage />} />
          <Route path="/audit" element={<AuditLogPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
