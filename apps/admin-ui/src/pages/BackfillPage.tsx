import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../providers/AuthProvider.js';
import { apiRequest } from '../utils/api.js';
import type { BackfillResult } from '../types/api.js';

const BackfillPage: React.FC = () => {
  const { token } = useAuth();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [userId, setUserId] = useState('');
  const [dryRun, setDryRun] = useState(true);

  const backfillMutation = useMutation({
    mutationFn: async () => {
      return apiRequest<{ result: BackfillResult }>(token, '/backfill', {
        method: 'POST',
        body: {
          from,
          to,
          userId: userId || undefined,
          dryRun
        }
      });
    }
  });

  const result = backfillMutation.data?.result;

  return (
    <div className="stack">
      <section className="card">
        <h2>Backfill runner</h2>
        <p className="notice">
          Start with a dry run to preview changes. Switching off dry-run will PATCH custom field values in Clockify.
        </p>
        <form
          className="form-grid"
          onSubmit={event => {
            event.preventDefault();
            backfillMutation.mutate();
          }}
        >
          <label>
            From (ISO timestamp)
            <input type="text" value={from} onChange={event => setFrom(event.target.value)} placeholder="2024-03-01T00:00:00Z" />
          </label>
          <label>
            To (ISO timestamp)
            <input type="text" value={to} onChange={event => setTo(event.target.value)} placeholder="2024-03-07T23:59:59Z" />
          </label>
          <label>
            User ID (optional)
            <input type="text" value={userId} onChange={event => setUserId(event.target.value)} placeholder="Clockify user ID" />
          </label>
          <label>
            Dry run
            <input type="checkbox" checked={dryRun} onChange={event => setDryRun(event.target.checked)} />
          </label>
          <div className="row" style={{ alignItems: 'flex-end' }}>
            <button className="primary" type="submit" disabled={backfillMutation.isPending}>
              {dryRun ? 'Preview changes' : 'Run backfill'}
            </button>
          </div>
        </form>
      </section>

      {backfillMutation.isPending ? <div className="card">Processing backfill…</div> : null}
      {backfillMutation.error ? <div className="error">Unable to process request</div> : null}

      {result ? (
        <section className="card">
          <h3>Summary</h3>
          <p>
            Scanned <strong>{result.scanned}</strong> entries and {result.dryRun ? 'would update' : 'updated'}{' '}
            <strong>{result.updated}</strong> entries.
          </p>
          {result.outcomes.length ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Entry</th>
                  <th>Updates</th>
                  <th>Correlation ID</th>
                </tr>
              </thead>
              <tbody>
                {result.outcomes.map(item => (
                  <tr key={item.correlationId}>
                    <td>{item.entryId}</td>
                    <td>{item.updates}</td>
                    <td>{item.correlationId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No changes detected.</p>
          )}
        </section>
      ) : null}
    </div>
  );
};

export default BackfillPage;
