import { z } from 'zod';
const TransferEmailBaseSchema = z.object({
    inboundEmail: z.coerce.string().optional().nullable(),
    isTransferProof: z.boolean().optional(),
    amount: z.number().nullable().optional(),
    currency: z.enum(['ARS', 'USD', 'EUR', 'OTHER']).optional(),
    transferDate: z.coerce.date().nullable().optional(),
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
    needsHumanReview: z.boolean().optional()
});
const TransferEmailSchema = TransferEmailBaseSchema
    .extend({
    _id: z.coerce.string(),
    inboundEmail: z.object({ _id: z.coerce.string(), messageId: z.string() }).nullable().optional()
});
export default TransferEmailSchema;
export { TransferEmailSchema, TransferEmailBaseSchema };
