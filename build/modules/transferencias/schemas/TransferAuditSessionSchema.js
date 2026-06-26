import { z } from 'zod';
const TransferAuditSessionBaseSchema = z.object({
    operator: z.coerce.string().optional(),
    status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'EXPIRED', 'CANCELLED']).optional(),
    startedAt: z.coerce.date().optional(),
    pausedAt: z.coerce.date().nullable().optional(),
    completedAt: z.coerce.date().nullable().optional(),
    lastActivityAt: z.coerce.date().nullable().optional(),
    expiresAt: z.coerce.date().nullable().optional(),
    batchSize: z.number().optional().default(5),
    assignedCount: z.number().optional().default(0),
    auditedCount: z.number().optional().default(0),
    validatedCount: z.number().optional().default(0),
    correctedCount: z.number().optional().default(0),
    discardedCount: z.number().optional().default(0),
    referredCount: z.number().optional().default(0),
});
const TransferAuditSessionSchema = TransferAuditSessionBaseSchema.extend({
    _id: z.coerce.string(),
    operator: z.object({ _id: z.coerce.string(), username: z.string().optional(), name: z.string().optional() }).or(z.coerce.string()),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});
export default TransferAuditSessionSchema;
export { TransferAuditSessionSchema, TransferAuditSessionBaseSchema };
