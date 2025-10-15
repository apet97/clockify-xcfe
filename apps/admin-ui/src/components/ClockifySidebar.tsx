import React, { useEffect, useState } from 'react';
import { logger } from '../utils/logger';

interface ClockifyJwtPayload {
  iss: string;
  sub: string;
  type: string;
  workspaceId: string;
  user: string;
  addonId: string;
  backendUrl: string;
  reportsUrl: string;
  locationsUrl: string;
  screenshotsUrl: string;
  language?: string;
  theme?: string;
  workspaceRole?: string;
  exp?: number;
  iat?: number;
}

interface ClockifySidebarProps {
  authToken: string;
  userId: string;
}

export const ClockifySidebar: React.FC<ClockifySidebarProps> = ({ authToken, userId }) => {
  const [jwtPayload, setJwtPayload] = useState<ClockifyJwtPayload | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeComponent();
  }, [authToken]);

  const initializeComponent = async () => {
    try {
      setLoading(true);
      setError(null);

      // Decode JWT payload (for debugging - in production, validate signature)
      const payload = decodeJwtPayload(authToken);
      if (!payload) {
        throw new Error('Invalid JWT token');
      }

      setJwtPayload(payload);

      // Get user information from Clockify API
      const userData = await fetchUserData(payload);
      setUser(userData);

      logger.info('Clockify sidebar initialized', {
        workspaceId: payload.workspaceId,
        userId: payload.user,
        language: payload.language,
        theme: payload.theme
      });

    } catch (err) {
      logger.error('Failed to initialize Clockify sidebar', { error: err });
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const decodeJwtPayload = (token: string): ClockifyJwtPayload | null => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      logger.warn('Failed to decode JWT payload', { error });
      return null;
    }
  };

  const fetchUserData = async (payload: ClockifyJwtPayload) => {
    const response = await fetch(`${payload.backendUrl}/v1/user`, {
      method: 'GET',
      headers: {
        'X-Addon-Token': authToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
  };

  const requestTokenRefresh = () => {
    // Send message to parent Clockify window to refresh the token
    window.parent?.postMessage({
      type: 'refreshAddonToken'
    }, '*');
  };

  const showToast = (type: 'info' | 'warning' | 'success' | 'error', message: string) => {
    window.parent?.postMessage({
      type: 'toastrPop',
      payload: { type, message }
    }, '*');
  };

  const navigateToTracker = () => {
    window.parent?.postMessage({
      type: 'navigate',
      payload: { type: 'tracker' }
    }, '*');
  };

  if (loading) {
    return (
      <div className="clockify-sidebar-loading">
        <div className="loading-spinner"></div>
        <p>Loading Formula Manager...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="clockify-sidebar-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={initializeComponent}>Retry</button>
      </div>
    );
  }

  return (
    <div className="clockify-sidebar">
      <header className="sidebar-header">
        <h1>Formula Manager</h1>
        <div className="user-info">
          <span>Welcome, {user?.name || 'User'}</span>
          <span className="workspace-id">Workspace: {jwtPayload?.workspaceId}</span>
        </div>
      </header>

      <main className="sidebar-content">
        <div className="quick-actions">
          <button onClick={navigateToTracker} className="btn-primary">
            Go to Tracker
          </button>
          <button onClick={() => showToast('info', 'Formula Manager loaded!')} className="btn-secondary">
            Test Toast
          </button>
        </div>

        <div className="formula-stats">
          <h3>Formula Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Active Formulas</span>
              <span className="stat-value">0</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Evaluations Today</span>
              <span className="stat-value">0</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Success Rate</span>
              <span className="stat-value">100%</span>
            </div>
          </div>
        </div>

        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            <p className="no-activity">No recent activity</p>
          </div>
        </div>
      </main>

      <footer className="sidebar-footer">
        <button onClick={requestTokenRefresh} className="btn-link">
          Refresh Token
        </button>
        <div className="theme-info">
          Theme: {jwtPayload?.theme || 'DEFAULT'}
        </div>
      </footer>
    </div>
  );
};
