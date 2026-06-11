import { z } from 'zod';
const TransferEmailAdditionalAffiliateSchema = z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    documentNumber: z.string().optional(),
});
const TransferEmailBaseSchema = z.object({
    inboundEmail: z.coerce.string().optional().nullable(),
    emailMessageId: z.string().optional(),
    emailSubject: z.string().optional(),
    emailFromName: z.string().optional(),
    emailFromEmail: z.string().optional(),
    emailDocumentNumber: z.string().optional(),
    isTransferProof: z.boolean().optional(),
    amount: z.number().nullable().optional(),
    currency: z.enum(['ARS', 'USD', 'EUR', 'OTHER']).optional(),
    transferDate: z.coerce.date().nullable().optional(),
    emailDate: z.coerce.date().nullable().optional(),
    processDate: z.coerce.date().nullable().optional(),
    operationNumber: z.string().optional(),
    concept: z.string().optional(),
    originAccount: z.string().optional(),
    originCbu: z.string().optional(),
    originAlias: z.string().optional(),
    originBank: z.string().optional(),
    destinationAccount: z.string().optional(),
    destinationCbu: z.string().optional(),
    destinationAlias: z.string().optional(),
    destinationBank: z.string().optional(),
    affiliateName: z.string().optional(),
    affiliateEmail: z.string().optional(),
    affiliateDocumentNumber: z.string().optional(),
    affiliateStrategy: z.enum(['EMAIL_FROM', 'DNI_CUIL', 'CBU_CVU', 'NRO_CUENTA', 'EMAIL_DATA']).optional(),
    additionalAffiliates: z.array(TransferEmailAdditionalAffiliateSchema).optional().default([]),
    month: z.string().optional(),
    observations: z.string().optional(),
    needsHumanReview: z.boolean().optional()
});
const TransferEmailSchema = TransferEmailBaseSchema
    .extend({
    _id: z.coerce.string(),
    inboundEmail: z.object({ _id: z.coerce.string(), messageId: z.string() }).nullable().optional(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});
export default TransferEmailSchema;
export { TransferEmailSchema, TransferEmailBaseSchema };
