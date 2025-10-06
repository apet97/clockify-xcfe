import { createHash, randomBytes } from 'node:crypto';
import { SignJWT, jwtVerify, importSPKI } from 'jose';
import { CONFIG } from '../config/index.js';

const deriveSecret = () => createHash('sha256').update(CONFIG.ENCRYPTION_KEY).digest();
const secretKey = deriveSecret();

export type MagicLinkClaims = {
  sub: string;
  workspaceId: string;
  email?: string;
  scopes?: string[];
};

export const issueMagicLink = async (claims: MagicLinkClaims) => {
  const jti = randomBytes(12).toString('hex');
  const expires = Math.floor(Date.now() / 1000) + CONFIG.JWT_TTL_MINUTES * 60;

  const token = await new SignJWT({
    workspaceId: claims.workspaceId,
    email: claims.email,
    scopes: claims.scopes ?? []
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(claims.sub)
    .setJti(jti)
    .setAudience(CONFIG.JWT_AUDIENCE)
    .setIssuer(CONFIG.JWT_ISSUER)
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(secretKey);

  return { token, expiresAt: new Date(expires * 1000) };
};

export const verifyMagicLink = async (token: string) => {
  const { payload } = await jwtVerify(token, secretKey, {
    issuer: CONFIG.JWT_ISSUER,
    audience: CONFIG.JWT_AUDIENCE
  });
  return payload as MagicLinkClaims & { scopes?: string[] };
};

// Clockify Add-on JWT verification
export type ClockifyJwtClaims = {
  sub: string;  // addon key
  iss: string;  // 'clockify'
  type: string; // 'addon'
  addonId: string;
  workspaceId: string;
  userId?: string;
  backendUrl: string;
  reportsUrl: string;
  plan: string;
  exp: number;
  iat: number;
};

let clockifyPublicKey: any = null;

const decodeClockifyClaims = (token: string): ClockifyJwtClaims => {
  const segments = token.split('.');
  if (segments.length < 2) {
    throw new Error('Malformed JWT');
  }

  try {
    const payload = Buffer.from(segments[1], 'base64url').toString('utf8');
    return JSON.parse(payload) as ClockifyJwtClaims;
  } catch (error) {
    throw new Error(`Unable to decode lifecycle token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const getClockifyPublicKey = async () => {
  if (!CONFIG.RSA_PUBLIC_KEY_PEM) {
    throw new Error('Clockify RSA public key is not configured');
  }

  if (!clockifyPublicKey) {
    // Parse RSA public key from PEM format
    const pemKey = CONFIG.RSA_PUBLIC_KEY_PEM
      .replace(/-----BEGIN PUBLIC KEY-----/, '')
      .replace(/-----END PUBLIC KEY-----/, '')
      .replace(/\s/g, '');

    const fullPem = `-----BEGIN PUBLIC KEY-----\n${pemKey}\n-----END PUBLIC KEY-----`;
    clockifyPublicKey = await importSPKI(fullPem, 'RS256');
  }
  return clockifyPublicKey;
};

const validateClockifyClaims = (claims: ClockifyJwtClaims, expectedSub?: string) => {
  if (claims.type !== 'addon') {
    throw new Error('Invalid JWT type, expected "addon"');
  }

  if (expectedSub && claims.sub !== expectedSub) {
    throw new Error(`Invalid JWT subject, expected "${expectedSub}", got "${claims.sub}"`);
  }

  if (!claims.addonId || !claims.workspaceId || !claims.backendUrl) {
    throw new Error('Missing required JWT claims');
  }
};

export const verifyClockifyJwt = async (token: string, expectedSub?: string): Promise<ClockifyJwtClaims> => {
  try {
    if (CONFIG.DEV_ALLOW_UNSIGNED && !CONFIG.RSA_PUBLIC_KEY_PEM) {
      const claims = decodeClockifyClaims(token);
      validateClockifyClaims(claims, expectedSub);
      return claims;
    }

    const publicKey = await getClockifyPublicKey();

    const { payload } = await jwtVerify(token, publicKey, {
      issuer: 'clockify',
      algorithms: ['RS256']
    });

    const claims = payload as ClockifyJwtClaims;
    validateClockifyClaims(claims, expectedSub);
    return claims;
  } catch (error) {
    throw new Error(`JWT verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
