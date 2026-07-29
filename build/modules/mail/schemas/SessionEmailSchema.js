import { z } from 'zod';
const SessionEmailBaseSchema = z.object({
    mailbox: z.coerce.string(),
    user: z.coerce.string(),
    status: z.enum(['ACTIVE', 'PAUSED', 'CLOSED']).default('ACTIVE'),
    startedAt: z.coerce.date({ error: "validation.date" }),
    pausedAt: z.coerce.date().nullable().optional(),
    endedAt: z.coerce.date().nullable().optional(),
    lastActivityAt: z.coerce.date().nullable().optional(),
    maxAssignableEmails: z.number().default(0),
    assignedCount: z.number().default(0),
    repliedCount: z.number().default(0),
    closedCount: z.number().default(0),
    sessionRepliedInboundEmails: z.array(z.coerce.string()).optional(),
    capacityFillLockedUntil: z.coerce.date().nullable().optional(),
});
const SessionEmailSchema = SessionEmailBaseSchema.extend({
    _id: z.coerce.string(),
    mailbox: z.any(),
    user: z.any(),
});
export default SessionEmailSchema;
export { SessionEmailSchema, SessionEmailBaseSchema };
