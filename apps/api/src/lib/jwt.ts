import { createHash, randomBytes } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
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
