
import { z } from 'zod';


const SessionEmailBaseSchema = z.object({
      mailbox: z.coerce.string().min(1,'validation.required'),
    user: z.coerce.string().min(1,'validation.required'),
    status: z.enum(['ACTIVE', 'PAUSED', 'CLOSED']).default('ACTIVE'),
    startedAt: z.coerce.date({error: "validation.date"}),
    pausedAt: z.coerce.date().nullable().optional(),
    endedAt: z.coerce.date().nullable().optional(),
    lastActivityAt: z.coerce.date().nullable().optional(),
    maxAssignableEmails: z.number().min(0,'validation.required'),
    assignedCount: z.number().min(0,'validation.required'),
    repliedCount: z.number().min(0,'validation.required'),
    closedCount: z.number().min(0,'validation.required'),
    capacityFillLockedUntil: z.coerce.date().nullable().optional()
});

const SessionEmailSchema = SessionEmailBaseSchema
    .extend({
      _id: z.coerce.string(),
       mailbox: z.object({_id: z.coerce.string(), name: z.string()}),
user: z.object({_id: z.coerce.string(), name: z.string()})
    })

export default SessionEmailSchema;
export {SessionEmailSchema, SessionEmailBaseSchema}
