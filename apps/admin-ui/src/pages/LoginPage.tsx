import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../providers/AuthProvider.js';
import { apiRequest } from '../utils/api.js';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const magicLinkMutation = useMutation({
    mutationFn: async () => {
      return apiRequest<{ token: string; expiresAt: string }>(null, '/auth/magic-link', {
        method: 'POST',
        body: {
          userId,
          email: email || undefined
        }
      });
    },
    onSuccess: res => {
      login(res.token, { userId, email: email || undefined });
    },
    onError: err => {
      setError(err instanceof Error ? err.message : 'Unable to create magic link token');
    }
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!userId.trim()) {
      setError('User ID is required');
      return;
    }
    setError(null);
    magicLinkMutation.mutate();
  };

  return (
    <div className="app-shell" style={{ justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
        <h2>Sign in to xCFE Admin</h2>
        <p style={{ color: '#52606d', fontSize: '0.9rem' }}>
          Generate a short-lived token by providing your Clockify user ID (email optional). Tokens expire quickly—open a new session when needed.
        </p>
        {error ? <div className="error">{error}</div> : null}
        <form className="stack" onSubmit={handleSubmit}>
          <label>
            Clockify user ID
            <input type="text" value={userId} onChange={event => setUserId(event.target.value)} placeholder="usr_123" />
          </label>
          <label>
            Email (optional)
            <input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" />
          </label>
          <button className="primary" type="submit" disabled={magicLinkMutation.isPending}>
            Request access
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
