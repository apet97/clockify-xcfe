process.env.NODE_ENV = 'test';
process.env.WORKSPACE_ID = process.env.WORKSPACE_ID || '5f11791a4e759e12c40733ba';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://localhost:5432/xcfe_test';
process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'super-secret-test-key-that-is-long-enough';
process.env.PORT = process.env.PORT || '3000';
process.env.CLOCKIFY_WEBHOOK_SECRET = process.env.CLOCKIFY_WEBHOOK_SECRET || 'test-secret';
