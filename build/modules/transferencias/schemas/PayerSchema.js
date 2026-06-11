import { z } from 'zod';
const PayerStrategySchema = z.enum(['EMAIL_FROM', 'DNI_CUIL', 'CBU_CVU', 'NRO_CUENTA']);
const PayerAdditionalAffiliateSchema = z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    documentNumber: z.string().optional(),
});
const PayerBaseSchema = z.object({
    strategy: PayerStrategySchema,
    value: z.string().min(1, 'validation.required'),
    affiliateName: z.string().optional(),
    affiliateEmail: z.string().optional(),
    affiliateDocumentNumber: z.string().optional(),
    additionalAffiliates: z.array(PayerAdditionalAffiliateSchema).optional().default([])
});
const PayerSchema = PayerBaseSchema
    .extend({
    _id: z.coerce.string(),
});
export default PayerSchema;
export { PayerSchema, PayerBaseSchema };
