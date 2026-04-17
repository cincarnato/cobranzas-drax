import { z } from 'zod';
const PayerEntityBaseSchema = z.object({
    cuilCuit: z.string().optional(),
    nombre: z.string().min(1, 'validation.required'),
    cuentas: z.array(z.object({ numero: z.string().optional(),
        banco: z.string().optional() })).optional(),
    afiliados: z.array(z.object({ afiliadoId: z.coerce.string().optional().nullable(),
        relacion: z.enum(['titular', 'conyuge', 'familiar', 'empresa', 'tercero', 'otro']).optional(),
        metodoMatch: z.enum(['cuilCuit', 'cuenta+banco', 'nombre', 'manual']).optional() })).optional(),
    ultimaVezDetectado: z.coerce.date().nullable().optional()
});
const PayerEntitySchema = PayerEntityBaseSchema
    .extend({
    _id: z.coerce.string(),
});
export default PayerEntitySchema;
export { PayerEntitySchema, PayerEntityBaseSchema };
