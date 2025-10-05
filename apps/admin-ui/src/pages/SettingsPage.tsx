import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../providers/AuthProvider.js';
import { apiRequest } from '../utils/api.js';

const SettingsPage: React.FC = () => {
  const { token, user } = useAuth();
  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: () => apiRequest<{ status: string; workspaceId: string; timestamp: string }>(token, '/sites/health')
  });

  return (
    <div className="stack">
      <section className="card">
        <h2>Environment</h2>
        {healthQuery.isLoading ? <p>Checking API health…</p> : null}
        {healthQuery.error ? <div className="error">Unable to reach API</div> : null}
        {healthQuery.data ? (
          <ul>
            <li>Status: {healthQuery.data.status}</li>
            <li>Workspace ID: {healthQuery.data.workspaceId}</li>
            <li>Server time: {new Date(healthQuery.data.timestamp).toLocaleString()}</li>
          </ul>
        ) : null}
      </section>

      <section className="card">
        <h3>Region configuration</h3>
        <p>
          Align <code>CLOCKIFY_BASE_URL</code> with your workspace region. Refer to the Clockify docs for EU (<code>euc1</code>), USA (<code>use2</code>), UK (<code>euw2</code>), or AU (<code>apse2</code>) endpoints. Update <code>CLOCKIFY_REGION</code> in the API environment if you operate outside default.</p>
      </section>

      <section className="card">
        <h3>Session</h3>
        <p>Authenticated as {user?.userId ?? 'unknown user'}{user?.email ? ` (${user.email})` : ''}.</p>
        <p>Your token is stored only in this session. Close the tab or sign out to clear it.</p>
      </section>
    </div>
  );
};

export default SettingsPage;
