import 'dotenv/config';
import { z } from 'zod';

if (process.env.BASE_URL?.trim() === '') {
  delete process.env.BASE_URL;
}

const encryptionKeySchema = z
  .string()
  .min(32, 'ENCRYPTION_KEY must be at least 32 characters')
  .describe('Used to encrypt stored secrets and sign JWTs');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8080),
  BASE_URL: z
    .preprocess(value => {
      if (typeof value === 'string' && value.trim() === '') {
        return undefined;
      }
      return value;
    }, z.string().min(1))
    .default('http://localhost:8080'),
  
  // Marketplace Add-on Configuration
  ADDON_KEY: z.string().min(1).default('xcfe.example'),
  ADDON_NAME: z.string().min(1).default('xCustom Field Expander'),
  MIN_PLAN: z.enum(['FREE', 'BASIC', 'PRO', 'ENTERPRISE']).default('FREE'),
  RSA_PUBLIC_KEY_PEM: z
    .string()
    .min(1)
    .optional()
    .describe('RSA public key for Clockify JWT verification'),
  
  CLOCKIFY_BASE_URL: z
    .string()
    .url()
    .default('https://api.clockify.me/api/v1'),
  CLOCKIFY_REGION: z
    .enum(['euc1', 'use2', 'euw2', 'apse2'])
    .optional()
    .or(z.literal(''))
    .describe('Region code from docs to override base URL when necessary'),
  ADDON_TOKEN: z.string().min(1).optional(),
  API_KEY: z.string().min(1).optional(),
  ADDON_ID: z.string().optional(),
  WEBHOOK_PUBLIC_URL: z.string().url().optional(),
  ADMIN_UI_ORIGIN: z.string().url().optional(),
  WORKSPACE_ID: z.string().min(1).default('dev-workspace'),
  DATABASE_URL: z.string().min(1),
  ENCRYPTION_KEY: encryptionKeySchema,
  JWT_AUDIENCE: z.string().min(1).default('xcfe-admin-ui'),
  JWT_ISSUER: z.string().min(1).default('xcfe'),
  JWT_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  CLOCKIFY_WEBHOOK_SECRET: z.string().min(1).optional(),
  DEV_ALLOW_UNSIGNED: z.coerce.boolean().default(false),
  WEBHOOK_RECONCILE: z.coerce.boolean().default(false),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  RATE_LIMIT_RPS: z.coerce.number().int().positive().default(50),
  RATE_LIMIT_MAX_BACKOFF_MS: z.coerce.number().int().positive().default(5000),
  SKIP_DATABASE_CHECKS: z.coerce.boolean().default(false)
}).superRefine((env, ctx) => {
  if (!env.RSA_PUBLIC_KEY_PEM && !env.DEV_ALLOW_UNSIGNED) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['RSA_PUBLIC_KEY_PEM'],
      message: 'RSA_PUBLIC_KEY_PEM must be provided unless DEV_ALLOW_UNSIGNED=true'
    });
  }

  try {
    // eslint-disable-next-line no-new
    new URL(env.BASE_URL);
  } catch {
    if (env.NODE_ENV === 'production') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['BASE_URL'],
        message: 'BASE_URL must be a valid URL in production'
      });
    } else {
      env.BASE_URL = 'http://localhost:8080';
    }
  }
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const formatted = parsed.error.format();
  throw new Error(`Invalid environment configuration: ${JSON.stringify(formatted)}`);
}

const env = parsed.data;

export type Env = typeof env;

export const CONFIG = env;
