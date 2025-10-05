import { z } from 'zod';

export const clockifyIdSchema = z.string().min(1);

export const customFieldValueSchema = z.object({
  customFieldId: clockifyIdSchema,
  timeEntryId: clockifyIdSchema.optional(),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]).nullable().optional(),
  name: z.string().optional(),
  type: z.string().optional()
});

export const clockifyTimeIntervalSchema = z.object({
  start: z.string(),
  end: z.string().nullable().optional(),
  duration: z.string().nullable().optional()
});

export const clockifyUserSchema = z.object({
  id: clockifyIdSchema,
  name: z.string().optional(),
  status: z.string().optional()
});

export const clockifyProjectSchema = z
  .object({
    id: clockifyIdSchema,
    name: z.string(),
    clientId: clockifyIdSchema.optional(),
    clientName: z.string().optional(),
    billable: z.boolean().optional(),
    color: z.string().optional()
  })
  .partial({ clientId: true, clientName: true, billable: true, color: true });

export const clockifyTaskSchema = z
  .object({
    id: clockifyIdSchema,
    name: z.string(),
    projectId: clockifyIdSchema.optional()
  })
  .partial({ projectId: true });

export const clockifyTagSchema = z.object({
  id: clockifyIdSchema,
  name: z.string()
});

export const clockifyTimeEntrySchema = z.object({
  id: clockifyIdSchema,
  description: z.string().nullable().optional(),
  tagIds: z.array(clockifyIdSchema).optional(),
  userId: clockifyIdSchema,
  billable: z.boolean().optional(),
  taskId: clockifyIdSchema.nullable().optional(),
  projectId: clockifyIdSchema.nullable().optional(),
  timeInterval: clockifyTimeIntervalSchema,
  workspaceId: clockifyIdSchema,
  isLocked: z.boolean().optional(),
  hourlyRate: z
    .object({ amount: z.number().optional(), currency: z.string().optional() })
    .partial()
    .nullable()
    .optional(),
  costRate: z
    .object({ amount: z.number().optional(), currency: z.string().optional() })
    .partial()
    .nullable()
    .optional(),
  customFieldValues: z.array(customFieldValueSchema).default([]),
  project: clockifyProjectSchema.optional(),
  task: clockifyTaskSchema.optional(),
  user: clockifyUserSchema.optional(),
  tags: z.array(clockifyTagSchema).optional(),
  amount: z.number().optional()
});

export const webhookEventTypeSchema = z.enum([
  'NEW_TIME_ENTRY',
  'NEW_TIMER_STARTED',
  'TIME_ENTRY_UPDATED',
  'TIME_ENTRY_DELETED',
  'BILLABLE_RATE_UPDATED'
]);

export const clockifyWebhookEnvelopeSchema = z.object({
  event: webhookEventTypeSchema.optional(),
  eventType: webhookEventTypeSchema.optional(),
  payload: z.unknown().optional()
});

export const billableRateUpdatedSchema = z.object({
  workspaceId: clockifyIdSchema,
  rateChangeSource: z.string(),
  modifiedEntity: z.object({
    userId: clockifyIdSchema,
    hourlyRate: z.object({ amount: z.number().optional() }).partial(),
    costRate: z.object({ amount: z.number().optional() }).partial(),
    targetId: clockifyIdSchema.optional(),
    membershipType: z.string().optional(),
    membershipStatus: z.string().optional()
  }),
  currency: z.object({
    id: clockifyIdSchema.optional(),
    code: z.string().optional()
  }),
  amount: z.number().optional(),
  since: z.string().optional()
});

export type ClockifyTimeEntry = z.infer<typeof clockifyTimeEntrySchema>;
export type ClockifyCustomFieldValue = z.infer<typeof customFieldValueSchema>;
export type ClockifyWebhookEvent = z.infer<typeof webhookEventTypeSchema>;
export type ClockifyRateUpdate = z.infer<typeof billableRateUpdatedSchema>;
