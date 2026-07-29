import { z } from 'zod';
const OutboundEmailAttachmentSchema = z.object({
    filename: z.string().optional(),
    filepath: z.string().optional(),
    size: z.number().optional(),
    mimetype: z.string().optional(),
    url: z.string().optional(),
});
const OutboundEmailBaseSchema = z.object({
    inboundEmail: z.coerce.string().optional().nullable(),
    mailbox: z.coerce.string().min(1, 'validation.required'),
    user: z.coerce.string().optional().nullable(),
    fromEmail: z.string().min(1, 'validation.required'),
    toEmails: z.array(z.string()),
    ccEmails: z.array(z.string()).optional(),
    bccEmails: z.array(z.string()).optional(),
    subject: z.string().min(1, 'validation.required'),
    bodyText: z.string().optional(),
    bodyHtml: z.string().optional(),
    attachments: z.array(OutboundEmailAttachmentSchema).optional(),
    status: z.enum(['DRAFT', 'QUEUED', 'SENDING', 'SENT', 'FAILED', 'CANCELLED']).default('DRAFT'),
    messageId: z.string().optional(),
    inReplyTo: z.string().optional(),
    references: z.array(z.string()).optional(),
    sentAt: z.coerce.date().nullable().optional(),
    lastError: z.string().optional(),
    attempts: z.number().nullable().optional().default(0)
});
const OutboundEmailSchema = OutboundEmailBaseSchema
    .extend({
    _id: z.coerce.string(),
    inboundEmail: z.object({ _id: z.coerce.string(), messageId: z.string() }).nullable().optional(),
    mailbox: z.object({ _id: z.coerce.string(), email: z.string() }),
    user: z.object({
        _id: z.coerce.string(),
        name: z.string().optional(),
        username: z.string().optional(),
        email: z.string().optional()
    }).nullable().optional()
});
export default OutboundEmailSchema;
export { OutboundEmailSchema, OutboundEmailBaseSchema, OutboundEmailAttachmentSchema };
