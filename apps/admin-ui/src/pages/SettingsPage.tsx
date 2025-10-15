import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../providers/AuthProvider.js';
import { apiRequest } from '../utils/api.js';
import type { Settings, HealthStatus } from '../types/api.js';

const SettingsPage: React.FC = () => {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  
  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: () => apiRequest<HealthStatus>(token, '/sites/health')
  });

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: () => apiRequest<Settings>(token, '/settings')
  });

  const [localSettings, setLocalSettings] = useState<Settings>({
    strict_mode: false,
    reference_months: 3,
    region: ''
  });

  React.useEffect(() => {
    if (settingsQuery.data) {
      setLocalSettings(settingsQuery.data);
    }
  }, [settingsQuery.data]);

  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: Settings) => {
      return apiRequest(token, '/settings', {
        method: 'POST',
        body: settings
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    }
  });

  return (
    <div className="stack">
      <section className="card">
        <h2>System Health</h2>
        {healthQuery.isLoading ? <p>Checking API health…</p> : null}
        {healthQuery.error ? <div className="error">Unable to reach API</div> : null}
        {healthQuery.data ? (
          <div className="stats-grid">
            <div className="stat">
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: healthQuery.data.ok ? '#28a745' : '#d73a49' }}>
                {healthQuery.data.ok ? 'OK' : 'Error'}
              </div>
              <div>API Status</div>
            </div>
            <div className="stat">
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: healthQuery.data.db.reachable ? '#28a745' : '#d73a49' }}>
                {healthQuery.data.db.reachable ? 'Connected' : 'Error'}
              </div>
              <div>Database</div>
            </div>
            <div className="stat">
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                {healthQuery.data.workspaceId.slice(-8)}
              </div>
              <div>Workspace</div>
            </div>
            <div className="stat">
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                {new Date(healthQuery.data.timestamp).toLocaleTimeString()}
              </div>
              <div>Server Time</div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="card">
        <h2>Application Settings</h2>
        {error && <div className="error">{error}</div>}
        {settingsQuery.isLoading ? <p>Loading settings…</p> : null}
        {settingsQuery.error ? <div className="error">Failed to load settings</div> : null}
        
        <form className="stack" onSubmit={(e) => {
          e.preventDefault();
          saveSettingsMutation.mutate(localSettings);
        }}>
          <label>
            <input
              type="checkbox"
              checked={localSettings.strict_mode}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, strict_mode: e.target.checked }))}
            />
            Strict mode (fail on validation errors)
          </label>
          
          <label>
            Reference months for calculations
            <input
              type="number"
              min={1}
              max={12}
              value={localSettings.reference_months}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, reference_months: Number(e.target.value) }))}
            />
          </label>
          
          <label>
            Clockify region override
            <select
              value={localSettings.region || ''}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, region: e.target.value || undefined }))}
            >
              <option value="">Default</option>
              <option value="euc1">EU Central (euc1)</option>
              <option value="use2">US East (use2)</option>
              <option value="euw2">EU West (euw2)</option>
              <option value="apse2">Asia Pacific (apse2)</option>
            </select>
          </label>
          
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              className="primary" 
              disabled={saveSettingsMutation.isPending}
            >
              {saveSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <h3>Session Information</h3>
        <p>Authenticated as {user?.userId ?? 'unknown user'}{user?.email ? ` (${user.email})` : ''}.</p>
        <p>Your authentication token is stored only in this browser session and will be cleared when you close the tab.</p>
      </section>
    </div>
  );
};

export default SettingsPage;
