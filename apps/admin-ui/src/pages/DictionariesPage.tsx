import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../providers/AuthProvider.js';
import { apiRequest } from '../utils/api.js';
import Modal from '../components/Modal.js';
import JsonEditor from '../components/JsonEditor.js';
import type { DictionaryRule } from '../types/api.js';

const defaultPayload = {
  type: 'dropdown',
  allowedValues: ['REG', 'OT'],
  mode: 'warn'
};

type Draft = {
  fieldKey: string;
  json: string;
};

const DictionariesPage: React.FC = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dictionariesQuery = useQuery({
    queryKey: ['dictionaries'],
    queryFn: async () => {
      const res = await apiRequest<{ dictionaries: DictionaryRule[] }>(token, '/dictionaries');
      return res.dictionaries;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: Draft) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(payload.json);
      } catch (parseError) {
        throw new Error('JSON is invalid. Ensure it parses correctly.');
      }
      await apiRequest(token, '/dictionaries', {
        method: 'POST',
        body: {
          fieldKey: payload.fieldKey,
          ...(parsed as Record<string, unknown>)
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dictionaries'] });
      setDraft(null);
      setError(null);
    },
    onError: err => {
      setError(err instanceof Error ? err.message : 'Failed to save dictionary');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (fieldKey: string) => apiRequest(token, `/dictionaries/${encodeURIComponent(fieldKey)}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dictionaries'] })
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft?.fieldKey.trim()) {
      setError('Field key is required');
      return;
    }
    saveMutation.mutate(draft);
  };

  return (
    <div className="stack">
      <section className="card">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Dictionaries</h2>
          <button
            className="primary"
            type="button"
            onClick={() =>
              setDraft({ fieldKey: '', json: JSON.stringify(defaultPayload, null, 2) })
            }
          >
            New dictionary
          </button>
        </div>
        <p style={{ color: '#52606d', fontSize: '0.85rem' }}>
          Dictionaries gate formula output. Dropdown dictionaries enforce an allowed set, numeric ones enforce ranges.
        </p>
        {dictionariesQuery.isLoading ? <p>Loading…</p> : null}
        {dictionariesQuery.error ? <div className="error">Failed to load dictionaries</div> : null}
        {dictionariesQuery.data?.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Mode</th>
                <th>Details</th>
                <th aria-label="actions" />
              </tr>
            </thead>
            <tbody>
              {dictionariesQuery.data.map(rule => (
                <tr key={rule.fieldKey}>
                  <td>{rule.fieldKey}</td>
                  <td>{rule.type}</td>
                  <td>{rule.mode}</td>
                  <td>
                    {rule.type === 'dropdown'
                      ? (rule.allowedValues ?? []).join(', ')
                      : `${rule.numericRange?.min ?? '−∞'} to ${rule.numericRange?.max ?? '+∞'}`}
                  </td>
                  <td>
                    <div className="row" style={{ justifyContent: 'flex-end' }}>
                      <button
                        className="ghost"
                        type="button"
                        onClick={() =>
                          setDraft({
                            fieldKey: rule.fieldKey,
                            json: JSON.stringify(
                              {
                                type: rule.type,
                                allowedValues: rule.allowedValues,
                                numericRange: rule.numericRange,
                                mode: rule.mode
                              },
                              null,
                              2
                            )
                          })
                        }
                      >
                        Edit
                      </button>
                      <button
                        className="ghost"
                        type="button"
                        onClick={() => deleteMutation.mutate(rule.fieldKey)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : !dictionariesQuery.isLoading ? (
          <p>No dictionaries configured.</p>
        ) : null}
      </section>

      {draft ? (
        <Modal title={draft.fieldKey ? `Edit ${draft.fieldKey}` : 'New dictionary'} onClose={() => setDraft(null)}>
          {error ? <div className="error">{error}</div> : null}
          <form className="stack" onSubmit={handleSubmit}>
            <label>
              Field key
              <input
                type="text"
                value={draft.fieldKey}
                onChange={event => setDraft(prev => prev ? { ...prev, fieldKey: event.target.value } : prev)}
                placeholder="Example: Status"
              />
            </label>
            <label>
              Dictionary JSON
              <JsonEditor
                value={draft.json}
                onChange={value => setDraft(prev => (prev ? { ...prev, json: value } : prev))}
                minRows={10}
              />
            </label>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button className="ghost" type="button" onClick={() => setDraft(null)}>
                Cancel
              </button>
              <button className="primary" type="submit" disabled={saveMutation.isPending}>
                Save dictionary
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
};

export default DictionariesPage;
