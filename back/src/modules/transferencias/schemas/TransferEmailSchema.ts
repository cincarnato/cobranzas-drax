
import { z } from 'zod';

const TransferEmailAffiliateSchema = z.object({
    name: z.string().optional(),
    amount: z.number().optional(),
    documentNumber: z.string().optional(),
    month: z.string().optional(),
    observations: z.string().optional(),
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
    affiliateStrategy: z.enum(['EMAIL_FROM', 'DNI_CUIL', 'CBU_CVU', 'NRO_CUENTA', 'EMAIL_DATA']).optional(),
    affiliates: z.array(TransferEmailAffiliateSchema).optional().default([]),
    aiStatus: z.enum(['PENDIENTE', 'PROCESADO_CONFIABLE', 'PROCESADO_CON_DUDAS', 'PROCESADO_INCOMPLETO', 'ERROR_PROCESAMIENTO']).optional(),
    aiProcessedAt: z.coerce.date().nullable().optional(),
    aiError: z.string().optional(),
    humanStatus: z.enum(['PENDIENTE', 'VALIDADO', 'CORREGIDO', 'DESCARTADO']).optional(),
    assignedTo: z.coerce.string().nullable().optional(),
    auditSessionId: z.coerce.string().nullable().optional(),
    assignedAt: z.coerce.date().nullable().optional(),
    assignmentExpiresAt: z.coerce.date().nullable().optional(),
    lastActivityAt: z.coerce.date().nullable().optional(),
    auditedBy: z.coerce.string().nullable().optional(),
    auditedAt: z.coerce.date().nullable().optional(),
    status: z.enum(['PENDIENTE_IA', 'PENDIENTE_AUDITORIA', 'AUDITADO']).optional(),
    needsHumanReview: z.boolean().optional()
});

const TransferEmailSchema = TransferEmailBaseSchema
    .extend({
      _id: z.coerce.string(),
       inboundEmail: z.object({_id: z.coerce.string(), messageId: z.string()}).nullable().optional(),
       assignedTo: z.object({_id: z.coerce.string(), username: z.string().optional(), name: z.string().optional()}).nullable().optional(),
       auditSessionId: z.coerce.string().nullable().optional(),
       auditedBy: z.object({_id: z.coerce.string(), username: z.string().optional(), name: z.string().optional()}).nullable().optional(),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date(),
    })

export default TransferEmailSchema;
export {TransferEmailSchema, TransferEmailBaseSchema}
