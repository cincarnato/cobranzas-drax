import { z } from 'zod';
const CallLogBaseSchema = z.object({
    callList: z.coerce.string().min(1, 'validation.required'),
    attempts: z.number().nullable().optional(),
    notes: z.string().optional(),
    typification: z.string().optional(),
    state: z.enum(['pendiente', 'intentada', 'fallida', 'promesa', 'exitosa']).optional().default('pendiente'),
    promiseDate: z.coerce.date().nullable().optional(),
    done: z.boolean().optional().default(false),
    data: z.record(z.string(), z.unknown()).optional().nullable()
});
const CallLogSchema = CallLogBaseSchema
    .extend({
    _id: z.coerce.string(),
    callList: z.object({ _id: z.coerce.string(), name: z.string() })
});
export default CallLogSchema;
export { CallLogSchema, CallLogBaseSchema };
