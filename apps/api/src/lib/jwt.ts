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

const getClockifyPublicKey = async () => {
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

export const verifyClockifyJwt = async (token: string, expectedSub?: string): Promise<ClockifyJwtClaims> => {
  try {
    const publicKey = await getClockifyPublicKey();
    
    const { payload } = await jwtVerify(token, publicKey, {
      issuer: 'clockify',
      algorithms: ['RS256']
    });

    // Validate required claims
    if (payload.type !== 'addon') {
      throw new Error('Invalid JWT type, expected "addon"');
    }

    if (expectedSub && payload.sub !== expectedSub) {
      throw new Error(`Invalid JWT subject, expected "${expectedSub}", got "${payload.sub}"`);
    }

    // Type assertion with validation
    const claims = payload as ClockifyJwtClaims;
    
    if (!claims.addonId || !claims.workspaceId || !claims.backendUrl) {
      throw new Error('Missing required JWT claims');
    }

    return claims;
  } catch (error) {
    throw new Error(`JWT verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
