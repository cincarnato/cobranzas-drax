import { z } from 'zod';
const PadronBaseSchema = z.object({
    origen: z.string().optional(),
    ente: z.number().nullable().optional(),
    contra: z.string().min(1, 'validation.required'),
    ape_nom: z.string().min(1, 'validation.required'),
    cant_inte: z.number().nullable().optional(),
    plan_codi: z.string().optional(),
    domicilio: z.string().optional(),
    loca: z.string().optional(),
    tele: z.string().optional(),
    deuda1: z.number().nullable().optional(),
    deuda2: z.number().nullable().optional(),
    deuda3: z.number().nullable().optional(),
    deuda4: z.number().nullable().optional(),
    periodo1: z.coerce.date().nullable().optional(),
    periodo2: z.coerce.date().nullable().optional(),
    periodo3: z.coerce.date().nullable().optional(),
    periodo4: z.coerce.date().nullable().optional(),
    subtotal: z.number().nullable().optional(),
    pago_forma: z.string().optional(),
    cobrador: z.string().optional(),
    total_ctacte: z.number().nullable().optional(),
    baja_fecha: z.coerce.date().nullable().optional(),
    nro_ref_elect: z.string().optional(),
    celular: z.string().optional(),
    deno_provin: z.string().optional()
});
const PadronSchema = PadronBaseSchema
    .extend({
    _id: z.coerce.string(),
});
export default PadronSchema;
export { PadronSchema, PadronBaseSchema };
