import { z } from 'zod';
const AffiliateTypeBaseSchema = z.object({
    nombre: z.string().min(1, 'validation.required'),
    descripcion: z.string().optional()
});
const AffiliateTypeSchema = AffiliateTypeBaseSchema
    .extend({
    _id: z.coerce.string(),
});
export default AffiliateTypeSchema;
export { AffiliateTypeSchema, AffiliateTypeBaseSchema };
