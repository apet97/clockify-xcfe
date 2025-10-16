#!/usr/bin/env node
/**
 * Token Verification Script
 *
 * Decodes a Clockify add-on JWT token and prints the claims.
 * Usage: node scripts/verify-token.js <token>
 */

const token = process.argv[2];

if (!token) {
  console.error('Usage: node scripts/verify-token.js <token>');
  console.error('');
  console.error('Example:');
  console.error('  node scripts/verify-token.js eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...');
  process.exit(1);
}

try {
  // Decode JWT without verification (just for inspection)
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format - expected 3 parts separated by dots');
  }

  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));

  console.log('✓ Successfully decoded JWT token\n');
  console.log('Issuer (iss):', payload.iss || '(missing)');
  console.log('Type:', payload.type || '(missing)');
  console.log('Subject (sub):', payload.sub || '(missing)');
  console.log('');
  console.log('Backend URL:', payload.backendUrl || '(missing)');
  console.log('Workspace ID:', payload.workspaceId || '(missing)');
  console.log('');

  if (payload.user) {
    console.log('User:');
    console.log('  ID:', payload.user.id || payload.user || '(missing)');
    console.log('  Email:', payload.user.email || '(not provided)');
    console.log('  Name:', payload.user.name || '(not provided)');
  } else if (payload.userId) {
    console.log('User ID:', payload.userId);
  } else {
    console.log('User: (missing)');
  }

  console.log('');

  if (payload.iat) {
    const issuedAt = new Date(payload.iat * 1000);
    console.log('Issued At:', issuedAt.toISOString(), `(${Math.floor((Date.now() / 1000) - payload.iat)}s ago)`);
  }

  if (payload.exp) {
    const expiresAt = new Date(payload.exp * 1000);
    const secondsUntilExpiry = payload.exp - Math.floor(Date.now() / 1000);
    const status = secondsUntilExpiry > 0 ? `✓ valid for ${secondsUntilExpiry}s` : '✗ EXPIRED';
    console.log('Expires At:', expiresAt.toISOString(), `(${status})`);
  }

  console.log('');
  console.log('Full payload:');
  console.log(JSON.stringify(payload, null, 2));

} catch (error) {
  console.error('✗ Error decoding token:', error.message);
  process.exit(1);
}
