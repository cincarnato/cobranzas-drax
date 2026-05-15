import { z } from 'zod';
const BonusBaseSchema = z.object({
    dni: z.string().min(1, 'validation.required'),
    fullname: z.string().min(1, 'validation.required'),
    plan: z.string().min(1, 'validation.required'),
    appliedMonth: z.string().min(1, 'validation.required'),
    paymentMethod: z.string().min(1, 'validation.required'),
    bonus: z.string().min(1, 'validation.required'),
    bonifiedNetValue: z.coerce.number().min(0, 'validation.required'),
    status: z.enum(['Pendiente', 'Aplicado', 'No aplicado']).default('Pendiente'),
    observation: z.string().optional(),
    createdBy: z.coerce.string().optional()
});
const BonusSchema = BonusBaseSchema
    .extend({
    _id: z.coerce.string(),
    createdBy: z.object({ _id: z.coerce.string(), name: z.string() }),
    createdAt: z.coerce.date().optional(),
});
export default BonusSchema;
export { BonusSchema, BonusBaseSchema };
