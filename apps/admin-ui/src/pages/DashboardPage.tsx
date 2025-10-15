import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../providers/AuthProvider.js';
import { apiRequest } from '../utils/api.js';
import type { HealthStatus } from '../types/api.js';
import type { DictionaryRule, Formula, RunRecord } from '../types/api.js';

const DashboardPage: React.FC = () => {
  const { token } = useAuth();

  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: () => apiRequest<HealthStatus>(token, '/sites/health')
  });

  const formulasQuery = useQuery({
    queryKey: ['formulas'],
    queryFn: () => apiRequest<{ formulas: Formula[] }>(token, '/formulas')
  });

  const dictionariesQuery = useQuery({
    queryKey: ['dictionaries'],
    queryFn: () => apiRequest<{ dictionaries: DictionaryRule[] }>(token, '/dictionaries')
  });

  const recentRunsQuery = useQuery({
    queryKey: ['runs', 'recent'],
    queryFn: () => apiRequest<{ runs: RunRecord[] }>(token, '/runs?limit=5')
  });

  return (
    <div className="stack">
      <section className="card">
        <h2>System health</h2>
        {healthQuery.isLoading ? <p>Checking API health…</p> : null}
        {healthQuery.error ? <div className="error">Unable to reach API</div> : null}
        {healthQuery.data ? (
          <ul>
            <li>Status: {healthQuery.data.status}</li>
            <li>Workspace: {healthQuery.data.workspaceId}</li>
            <li>Server time: {new Date(healthQuery.data.timestamp).toLocaleString()}</li>
          </ul>
        ) : null}
      </section>

      <section className="card">
        <h2>Inventory</h2>
        <div className="stats-grid">
          <div className="stat">
            <span className="stat-value">{formulasQuery.data?.formulas.length ?? '—'}</span>
            <span className="stat-label">Formulas</span>
          </div>
          <div className="stat">
            <span className="stat-value">{dictionariesQuery.data?.dictionaries.length ?? '—'}</span>
            <span className="stat-label">Dictionaries</span>
          </div>
          <div className="stat">
            <span className="stat-value">{recentRunsQuery.data?.runs.length ?? '—'}</span>
            <span className="stat-label">Recent runs</span>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Latest activity</h2>
        {recentRunsQuery.isLoading ? <p>Loading audit log…</p> : null}
        {recentRunsQuery.error ? <div className="error">Audit log unavailable</div> : null}
        {recentRunsQuery.data?.runs?.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>When</th>
                <th>Status</th>
                <th>Entry</th>
                <th>Duration (ms)</th>
              </tr>
            </thead>
            <tbody>
              {recentRunsQuery.data.runs.map(run => (
                <tr key={run.id}>
                  <td>{new Date(run.ts).toLocaleString()}</td>
                  <td>{run.status}</td>
                  <td>{run.entryId}</td>
                  <td>{run.ms ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No recent runs recorded.</p>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
