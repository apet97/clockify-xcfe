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
        <section className="card stack">
          <h3>Results</h3>
          
          <div className="stats-grid">
            <div className="stat">
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{result.scanned}</div>
              <div>Entries Scanned</div>
            </div>
            <div className="stat">
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: result.updated > 0 ? '#28a745' : '#52606d' }}>
                {result.updated}
              </div>
              <div>{result.dryRun ? 'Would Update' : 'Updated'}</div>
            </div>
            <div className="stat">
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{result.dayResults.length}</div>
              <div>Days Processed</div>
            </div>
          </div>

          {result.dayResults.length > 0 && (
            <div>
              <h4>Daily Breakdown</h4>
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Entries</th>
                    <th>{result.dryRun ? 'Would Update' : 'Updated'}</th>
                    <th>Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {result.dayResults.map(day => (
                    <tr key={day.date}>
                      <td>{day.date}</td>
                      <td>{day.entries}</td>
                      <td style={{ color: day.updated > 0 ? '#28a745' : undefined }}>
                        {day.updated}
                      </td>
                      <td style={{ color: day.errors > 0 ? '#d73a49' : undefined }}>
                        {day.errors}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.outcomes.length > 0 && (
            <div>
              <h4>Entry Details {result.outcomes.length > 20 && `(showing first 20 of ${result.outcomes.length})`}</h4>
              <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Entry ID</th>
                      <th>Updates</th>
                      <th>Status</th>
                      <th>Correlation ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.outcomes.slice(0, 20).map(item => (
                      <tr key={item.correlationId}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          {item.entryId.slice(-8)}
                        </td>
                        <td>{item.updates}</td>
                        <td>
                          {item.error ? (
                            <span style={{ color: '#d73a49' }}>Error</span>
                          ) : item.updates > 0 ? (
                            <span style={{ color: '#28a745' }}>Changes</span>
                          ) : (
                            'No changes'
                          )}
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          {item.correlationId.slice(-8)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {result.outcomes.length === 0 && (
            <p>No entries found in the specified date range.</p>
          )}
        </section>
      ) : null}
    </div>
  );
};

export default BackfillPage;
