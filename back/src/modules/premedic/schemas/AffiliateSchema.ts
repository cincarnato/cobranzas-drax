
import { z } from 'zod';


const AffiliateBaseSchema = z.object({
      apellidoNombre: z.string().min(1,'validation.required'),
    dni: z.string().min(1,'validation.required'),
    cuilCuit: z.string().optional(),
    tipo: z.string().optional(),
    titular: z.coerce.string().optional().nullable(),
    titularDni: z.string().min(1,'validation.required')
});

const AffiliateSchema = AffiliateBaseSchema
    .extend({
      _id: z.coerce.string(),
       titular: z.object({_id: z.coerce.string(), apellidoNombre: z.string()}).nullable().optional()
    })

export default AffiliateSchema;
export {AffiliateSchema, AffiliateBaseSchema}
