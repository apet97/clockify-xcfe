import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../providers/AuthProvider.js';
import { apiRequest } from '../utils/api.js';
import Modal from '../components/Modal.js';
import type { Formula, BackfillResult } from '../types/api.js';

const EVENTS = ['NEW_TIME_ENTRY', 'NEW_TIMER_STARTED', 'TIME_ENTRY_UPDATED', 'TIME_ENTRY_DELETED', 'BILLABLE_RATE_UPDATED'] as const;

type Draft = {
  id?: string;
  fieldKey: string;
  expr: string;
  priority: number;
  onEvents: string[];
};

const newDraft = (): Draft => ({
  fieldKey: '',
  expr: '',
  priority: 100,
  onEvents: ['NEW_TIME_ENTRY', 'TIME_ENTRY_UPDATED']
});

const FormulasPage: React.FC = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDryRun, setShowDryRun] = useState(false);
  const [dryRunResult, setDryRunResult] = useState<BackfillResult | null>(null);

  const formulasQuery = useQuery({
    queryKey: ['formulas'],
    queryFn: async () => {
      const res = await apiRequest<{ formulas: Formula[] }>(token, '/formulas');
      return res.formulas;
    }
  });

  const sorted = useMemo(() => (formulasQuery.data ?? []).slice().sort((a, b) => a.priority - b.priority), [formulasQuery.data]);

  const saveFormula = useMutation({
    mutationFn: async (payload: Draft) => {
      const base = {
        fieldKey: payload.fieldKey,
        expr: payload.expr,
        priority: payload.priority,
        onEvents: payload.onEvents
      };
      if (payload.id) {
        await apiRequest(token, `/formulas/${payload.id}`, { method: 'PUT', body: base });
      } else {
        await apiRequest(token, '/formulas', { method: 'POST', body: base });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formulas'] });
      setDraft(null);
      setError(null);
    },
    onError: err => {
      setError(err instanceof Error ? err.message : 'Unable to save formula');
    }
  });

  const deleteFormula = useMutation({
    mutationFn: async (id: string) => apiRequest(token, `/formulas/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formulas'] })
  });

  const runDryRun = useMutation({
    mutationFn: async () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      
      return apiRequest<{ accepted: boolean; result: BackfillResult }>(token, '/backfill', {
        method: 'POST',
        body: {
          from: yesterday.toISOString(),
          to: today.toISOString(),
          dryRun: true
        }
      });
    },
    onSuccess: (data) => {
      setDryRunResult(data.result);
      setShowDryRun(true);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Dry run failed');
    }
  });

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft) return;
    if (!draft.fieldKey.trim() || !draft.expr.trim()) {
      setError('Field key and expression are required');
      return;
    }
    saveFormula.mutate(draft);
  };

  return (
    <div className="stack">
      <section className="card">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Formulas</h2>
          <div className="row">
            <button 
              className="ghost" 
              type="button" 
              onClick={() => runDryRun.mutate()}
              disabled={runDryRun.isPending}
            >
              {runDryRun.isPending ? 'Running...' : 'Preview (24h)'}
            </button>
            <button className="primary" type="button" onClick={() => setDraft(newDraft())}>
              New formula
            </button>
          </div>
        </div>
        <p style={{ color: '#52606d', fontSize: '0.85rem' }}>
          Formulas evaluate against Clockify webhook payloads. Use <code>CF("Field")</code> for cross-field references and helpers like <code>ROUND</code>, <code>IF</code>, and <code>WEEKDAY</code>.
        </p>
        {formulasQuery.isLoading ? <p>Loading formulas…</p> : null}
        {formulasQuery.error ? <div className="error">Failed to load formulas</div> : null}
        {sorted.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Expression</th>
                <th>Priority</th>
                <th>Events</th>
                <th aria-label="actions" />
              </tr>
            </thead>
            <tbody>
              {sorted.map(formula => (
                <tr key={formula.id}>
                  <td>{formula.fieldKey}</td>
                  <td style={{ maxWidth: 360 }}><code>{formula.expr}</code></td>
                  <td>{formula.priority}</td>
                  <td>{formula.onEvents.join(', ') || 'All'}</td>
                  <td>
                    <div className="row" style={{ justifyContent: 'flex-end' }}>
                      <button className="ghost" type="button" onClick={() => setDraft({ ...formula })}>
                        Edit
                      </button>
                      <button className="ghost" type="button" onClick={() => deleteFormula.mutate(formula.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : !formulasQuery.isLoading ? (
          <p>No formulas defined yet.</p>
        ) : null}
      </section>

      {draft ? (
        <Modal title={draft.id ? `Edit ${draft.fieldKey}` : 'New formula'} onClose={() => setDraft(null)}>
          {error ? <div className="error">{error}</div> : null}
          <form className="stack" onSubmit={handleSave}>
            <label>
              Target field key
              <input
                type="text"
                value={draft.fieldKey}
                onChange={event => setDraft(prev => prev ? { ...prev, fieldKey: event.target.value } : prev)}
                placeholder="Example: Amount"
              />
            </label>
            <label>
              Priority (lower runs first)
              <input
                type="number"
                value={draft.priority}
                min={0}
                onChange={event => setDraft(prev => prev ? { ...prev, priority: Number(event.target.value) } : prev)}
              />
            </label>
            <label>
              Expression
              <textarea
                value={draft.expr}
                onChange={event => setDraft(prev => prev ? { ...prev, expr: event.target.value } : prev)}
                placeholder='Example: ROUND(Duration.h * CF("Rate"), 2)'
              />
            </label>
            <label>
              Trigger events
              <select
                multiple
                value={draft.onEvents}
                onChange={event => {
                  const selections = Array.from(event.target.selectedOptions).map(option => option.value);
                  setDraft(prev => (prev ? { ...prev, onEvents: selections } : prev));
                }}
              >
                {EVENTS.map(event => (
                  <option key={event} value={event}>
                    {event}
                  </option>
                ))}
              </select>
            </label>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button className="ghost" type="button" onClick={() => setDraft(null)}>
                Cancel
              </button>
              <button className="primary" type="submit" disabled={saveFormula.isPending}>
                {draft.id ? 'Save changes' : 'Create formula'}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {showDryRun && dryRunResult ? (
        <Modal 
          title="Formula Preview Results (Last 24h)" 
          onClose={() => setShowDryRun(false)}
          size="large"
        >
          <div className="stack">
            <div className="row">
              <div className="card" style={{ flex: 1 }}>
                <strong>Scanned</strong>
                <div style={{ fontSize: '1.5rem' }}>{dryRunResult.scanned}</div>
              </div>
              <div className="card" style={{ flex: 1 }}>
                <strong>Would Update</strong>
                <div style={{ fontSize: '1.5rem' }}>{dryRunResult.updated}</div>
              </div>
              <div className="card" style={{ flex: 1 }}>
                <strong>Days</strong>
                <div style={{ fontSize: '1.5rem' }}>{dryRunResult.dayResults.length}</div>
              </div>
            </div>

            {dryRunResult.dayResults.length > 0 && (
              <div>
                <h4>Daily Breakdown</h4>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Entries</th>
                      <th>Would Update</th>
                      <th>Errors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dryRunResult.dayResults.map(day => (
                      <tr key={day.date}>
                        <td>{day.date}</td>
                        <td>{day.entries}</td>
                        <td>{day.updated}</td>
                        <td style={{ color: day.errors > 0 ? '#d73a49' : undefined }}>
                          {day.errors}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {dryRunResult.outcomes.length > 0 && (
              <div>
                <h4>Sample Changes</h4>
                <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Entry ID</th>
                        <th>Updates</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dryRunResult.outcomes.slice(0, 20).map(outcome => (
                        <tr key={outcome.entryId}>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            {outcome.entryId.slice(-8)}
                          </td>
                          <td>{outcome.updates}</td>
                          <td>
                            {outcome.error ? (
                              <span style={{ color: '#d73a49' }}>Error</span>
                            ) : outcome.updates > 0 ? (
                              <span style={{ color: '#28a745' }}>Changes</span>
                            ) : (
                              'No changes'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {dryRunResult.outcomes.length > 20 && (
                    <p style={{ textAlign: 'center', color: '#52606d', fontSize: '0.9rem' }}>
                      ... and {dryRunResult.outcomes.length - 20} more entries
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button className="ghost" onClick={() => setShowDryRun(false)}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
};

export default FormulasPage;
