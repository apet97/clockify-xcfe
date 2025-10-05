import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../providers/AuthProvider.js';
import { apiRequest } from '../utils/api.js';
import type { BackfillResult } from '../types/api.js';

const DryRunPage: React.FC = () => {
  const { token } = useAuth();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [userId, setUserId] = useState('');

  const dryRunMutation = useMutation({
    mutationFn: async () => {
      return apiRequest<{ result: BackfillResult }>(token, '/backfill', {
        method: 'POST',
        body: { from, to, userId: userId || undefined, dryRun: true }
      });
    }
  });

  const outcome = dryRunMutation.data?.result;

  return (
    <div className="stack">
      <section className="card">
        <h2>Dry run a backfill</h2>
        <p style={{ color: '#52606d', fontSize: '0.85rem' }}>
          Simulate formula execution over a date range without patching time entries. Use the Audit Log tab to inspect previous runs.
        </p>
        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            dryRunMutation.mutate();
          }}
        >
          <label>
            From (ISO timestamp)
            <input type="text" value={from} onChange={(event) => setFrom(event.target.value)} placeholder="2024-03-01T00:00:00Z" />
          </label>
          <label>
            To (ISO timestamp)
            <input type="text" value={to} onChange={(event) => setTo(event.target.value)} placeholder="2024-03-07T23:59:59Z" />
          </label>
          <label>
            User ID (optional)
            <input type="text" value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="Clockify user ID" />
          </label>
          <div className="row" style={{ alignItems: 'flex-end' }}>
            <button className="primary" type="submit" disabled={dryRunMutation.isPending}>
              Run dry preview
            </button>
          </div>
        </form>
      </section>

      {dryRunMutation.isPending ? <div className="card">Running dry preview…</div> : null}
      {dryRunMutation.error ? <div className="error">Unable to run dry preview</div> : null}

      {outcome ? (
        <section className="card">
          <h3>Dry run summary</h3>
          <p>
            Scanned <strong>{outcome.scanned}</strong> entries and would update <strong>{outcome.updated}</strong> entries.
          </p>
          {outcome.outcomes.length ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Entry</th>
                  <th>Updates</th>
                  <th>Correlation ID</th>
                </tr>
              </thead>
              <tbody>
                {outcome.outcomes.map((row) => (
                  <tr key={row.correlationId}>
                    <td>{row.entryId}</td>
                    <td>{row.updates}</td>
                    <td>{row.correlationId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No changes detected within the selected range.</p>
          )}
        </section>
      ) : null}
    </div>
  );
};

export default DryRunPage;
