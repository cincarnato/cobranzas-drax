import { z } from 'zod';
const InternalTransferBonusBaseSchema = z.object({
    dni: z.string().min(1, 'validation.required'),
    fullname: z.string().min(1, 'validation.required'),
    appliedMonth: z.string().min(1, 'validation.required'),
    bonifiedValue: z.number().min(0, 'validation.required'),
    bonusType: z.enum(['Crédito en Cuenta Corriente', 'Transferencia Bancaria']),
    bankDataAttachment: z.object({
        filename: z.string().optional(),
        filepath: z.string().optional(),
        size: z.number().optional(),
        mimetype: z.string().optional(),
        url: z.string().optional()
    }).optional().nullable().default(null),
    status: z.enum(['Pendiente', 'Aplicado', 'No aplicado']).default('Pendiente'),
    observation: z.string().optional(),
    createdBy: z.coerce.string().optional()
});
const InternalTransferBonusSchema = InternalTransferBonusBaseSchema
    .extend({
    _id: z.coerce.string(),
    createdBy: z.object({ _id: z.coerce.string(), name: z.string() }),
    createdAt: z.coerce.date().optional(),
});
export default InternalTransferBonusSchema;
export { InternalTransferBonusSchema, InternalTransferBonusBaseSchema };
