import { z } from 'zod';

const CallAttemptBaseSchema = z.object({
    date: z.coerce.date().optional().default(() => new Date()),
    user: z.coerce.string().optional().nullable(),
    result: z.string().min(1, 'validation.required'),
    callListName: z.string().min(1, 'validation.required'),
    callLogId: z.coerce.string().min(1, 'validation.required'),
    callLog: z.coerce.string().min(1, 'validation.required')
});

const CallAttemptSchema = CallAttemptBaseSchema
    .extend({
        _id: z.coerce.string(),
        user: z.object({_id: z.coerce.string(), name: z.string().optional()}).nullable().optional(),
        callLog: z.object({_id: z.coerce.string()})
    })

export default CallAttemptSchema;
export {CallAttemptSchema, CallAttemptBaseSchema}
