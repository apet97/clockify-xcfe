import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../providers/AuthProvider.js';
import { apiRequest } from '../utils/api.js';
import type { RunRecord } from '../types/api.js';

const STATUS_OPTIONS = ['all', 'success', 'skipped', 'error'] as const;

type StatusFilter = (typeof STATUS_OPTIONS)[number];

const AuditLogPage: React.FC = () => {
  const { token } = useAuth();
  const [status, setStatus] = useState<StatusFilter>('all');
  const runsQuery = useQuery({
    queryKey: ['runs'],
    queryFn: async () => {
      const res = await apiRequest<{ runs: RunRecord[] }>(token, '/runs?limit=200');
      return res.runs;
    }
  });

  const filtered = useMemo(() => {
    if (!runsQuery.data) return [] as RunRecord[];
    if (status === 'all') return runsQuery.data;
    return runsQuery.data.filter(run => run.status === status);
  }, [runsQuery.data, status]);

  return (
    <section className="card">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Audit log</h2>
        <select value={status} onChange={event => setStatus(event.target.value as StatusFilter)}>
          {STATUS_OPTIONS.map(option => (
            <option key={option} value={option}>
              {option === 'all' ? 'All statuses' : option}
            </option>
          ))}
        </select>
      </div>
      <p style={{ color: '#52606d', fontSize: '0.85rem' }}>
        Each webhook, backfill dry run, or mutation is captured here with correlation IDs for traceability.
      </p>
      {runsQuery.isLoading ? <p>Loading…</p> : null}
      {runsQuery.error ? <div className="error">Failed to load audit log</div> : null}
      {filtered.length ? (
        <table className="table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Status</th>
              <th>Entry</th>
              <th>User</th>
              <th>Duration (ms)</th>
              <th>Diff</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(run => (
              <tr key={run.id}>
                <td>{new Date(run.ts).toLocaleString()}</td>
                <td>{run.status}</td>
                <td>{run.entryId}</td>
                <td>{run.userId ?? '—'}</td>
                <td>{run.ms ?? '—'}</td>
                <td>
                  <pre style={{ margin: 0, maxWidth: 320, whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(run.diff ?? {}, null, 2)}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : !runsQuery.isLoading ? (
        <p>No audit entries match this filter.</p>
      ) : null}
    </section>
  );
};

export default AuditLogPage;
