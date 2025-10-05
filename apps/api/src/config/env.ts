import 'dotenv/config';
import { z } from 'zod';

const encryptionKeySchema = z
  .string()
  .min(32, 'ENCRYPTION_KEY must be at least 32 characters')
  .describe('Used to encrypt stored secrets and sign JWTs');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8080),
  CLOCKIFY_BASE_URL: z
    .string()
    .url()
    .default('https://api.clockify.me/api/v1'),
  CLOCKIFY_REGION: z
    .enum(['euc1', 'use2', 'euw2', 'apse2'])
    .optional()
    .describe('Region code from docs to override base URL when necessary'),
  ADDON_TOKEN: z.string().min(1).optional(),
  API_KEY: z.string().min(1).optional(),
  ADDON_ID: z.string().optional(),
  WEBHOOK_PUBLIC_URL: z.string().url().optional(),
  ADMIN_UI_ORIGIN: z.string().url().optional(),
  WORKSPACE_ID: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  ENCRYPTION_KEY: encryptionKeySchema,
  JWT_AUDIENCE: z.string().min(1).default('xcfe-admin-ui'),
  JWT_ISSUER: z.string().min(1).default('xcfe'),
  JWT_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  CLOCKIFY_WEBHOOK_SECRET: z.string().min(1).optional(),
  DEV_ALLOW_UNSIGNED: z.coerce.boolean().default(false),
  RATE_LIMIT_RPS: z.coerce.number().int().positive().default(50),
  RATE_LIMIT_MAX_BACKOFF_MS: z.coerce.number().int().positive().default(5000)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const formatted = parsed.error.format();
  throw new Error(`Invalid environment configuration: ${JSON.stringify(formatted)}`);
}

const env = parsed.data;

export type Env = typeof env;

export const CONFIG = env;
