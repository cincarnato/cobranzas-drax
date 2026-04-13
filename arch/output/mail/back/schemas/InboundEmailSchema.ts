
import { z } from 'zod';


const InboundEmailBaseSchema = z.object({
      messageId: z.string().min(1,'validation.required'),
    threadId: z.string().optional(),
    mailbox: z.string().optional(),
    sourceChannel: z.enum(['EMAIL', 'FORWARDED_EMAIL', 'MANUAL_UPLOAD', 'API']).default('EMAIL'),
    receivedAt: z.coerce.date({error: "validation.date"}),
    subject: z.string().optional(),
    fromName: z.string().optional(),
    fromEmail: z.string().optional(),
    toEmails: z.array(z.string()).optional(),
    ccEmails: z.array(z.string()).optional(),
    replyToEmail: z.string().optional(),
    bodyText: z.string().optional(),
    bodyHtml: z.string().optional(),
    normalizedText: z.string().optional(),
    hasAttachments: z.boolean().optional(),
    attachmentCount: z.number().nullable().optional(),
    attachments: z.array(z.object({
                filename: z.string().optional(),
                filepath: z.string().optional(),
                size: z.number().optional(),
                mimetype: z.string().optional(),
                url: z.string().optional()
                })).optional(),
    category: z.string().optional(),
    sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'MIXED']).optional(),
    urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    summary: z.string().optional(),
    tags: z.array(z.string()).optional(),
    aiModel: z.string().optional(),
    extractedData: z.object({    affiliateName: z.string().optional(),
    affiliateDocumentNumber: z.string().optional(),
    affiliateCuil: z.string().optional(),
    affiliateEmail: z.string().optional(),
    affiliatePhone: z.string().optional(),
    affiliate: z.coerce.string().optional().nullable(),
    extractedEntities: z.array(
z.object({    label: z.string().min(1,'validation.required'),
    value: z.string().optional(),
    source: z.enum(['SUBJECT', 'BODY', 'ATTACHMENT', 'MANUAL']).optional(),
    confidence: z.number().nullable().optional()})
    ).optional()}),
    processingStatus: z.enum(['PENDING', 'PROCESSING', 'PROCESSED', 'REVIEW_REQUIRED', 'REJECTED', 'ERROR']).default('PENDING'),
    reviewStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CORRECTED']).optional().default('PENDING'),
    needsHumanReview: z.boolean().optional(),
    autoApproved: z.boolean().optional(),
    isDuplicate: z.boolean().optional(),
    duplicateOfMessageId: z.string().optional(),
    rejectionReason: z.string().optional(),
    validationNotes: z.string().optional(),
    rawExtractionJson: z.string().optional(),
    processedAt: z.coerce.date().nullable().optional(),
    lastErrorAt: z.coerce.date().nullable().optional(),
    lastErrorMessage: z.string().optional()
});

const InboundEmailSchema = InboundEmailBaseSchema
    .extend({
      _id: z.coerce.string(),
       
    })

export default InboundEmailSchema;
export {InboundEmailSchema, InboundEmailBaseSchema}
