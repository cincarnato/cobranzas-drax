import {z} from 'zod';


const CallListBaseSchema = z.object({
    group: z.coerce.string().optional().nullable(),
    user: z.coerce.string().optional().nullable(),
    file: z.object({
        filename: z.string().optional(),
        filepath: z.string().optional(),
        size: z.number().optional(),
        mimetype: z.string().optional(),
        url: z.string().optional()
    }).optional().nullable().default(null),
    state: z.enum(['PREPARANDO', 'EN_CURSO', 'ARCHIVADO', 'FINALIZADO', 'VENCIDO']).optional().default('PREPARANDO'),
    total: z.number().nullable().optional(),
    attempts: z.number().nullable().optional(),
    attemptsControl: z.array(
        z.object({
            number: z.number().nullable().optional(),
            count: z.number().nullable().optional(),
            success: z.number().nullable().optional(),
            promises: z.number().nullable().optional()
        })
    ).optional(),
    success: z.number().nullable().optional(),
    promises: z.number().nullable().optional(),
    failed: z.number().nullable().optional(),
    isExportable: z.boolean().optional().default(false),
    deadline: z.coerce.date().nullable().optional(),
    name: z.string().min(1, 'validation.required'),
    headers: z.array(z.string()).optional()
});

const CallListSchema = CallListBaseSchema
    .extend({
        _id: z.coerce.string(),
        group: z.object({_id: z.coerce.string(), name: z.string()}).nullable().optional(),
        user: z.object({_id: z.coerce.string(), name: z.string()}).nullable().optional()
    })

export default CallListSchema;
export {CallListSchema, CallListBaseSchema}
