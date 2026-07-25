
import { z } from 'zod';


const MailboxBaseSchema = z.object({
      name: z.string().min(1,'validation.required'),
    email: z.string().min(1,'validation.required'),
    username: z.string().min(1,'validation.required'),
    password: z.string().min(1,'validation.required'),
    isActive: z.boolean().optional(),
    autoProcessEnabled: z.boolean().optional(),
    replyRequiredToClose: z.boolean().optional(),
    closeReasonRequired: z.boolean().optional(),
    categories: z.array(
z.object({    name: z.string().min(1,'validation.required'),
    description: z.string().optional()})
    ).optional(),
    closeReasons: z.array(
z.object({    name: z.string().min(1,'validation.required'),
    description: z.string().optional()})
    ).optional(),
    entities: z.array(
z.object({    name: z.string().min(1,'validation.required'),
    description: z.string().optional()})
    ).optional(),
    operators: z.array(z.coerce.string()).optional(),
    maxAssignableEmailsPerUser: z.number().nullable().optional(),
    processingProtocol: z.enum(['IMAP', 'POP']).optional().default('IMAP'),
    processingIntervalMinutes: z.number().nullable().optional().default(5),
    imapEnabled: z.boolean().optional(),
    imapHost: z.string().optional().default('mail.grupopremedic.com'),
    imapPort: z.number().nullable().optional().default(993),
    imapTls: z.boolean().optional(),
    popEnabled: z.boolean().optional(),
    popHost: z.string().optional().default('mail.grupopremedic.com'),
    popPort: z.number().nullable().optional().default(995),
    popTls: z.boolean().optional(),
    smtpEnabled: z.boolean().optional(),
    smtpHost: z.string().optional().default('mail.grupopremedic.com'),
    smtpPort: z.number().nullable().optional().default(465),
    smtpTls: z.boolean().optional()
});

const MailboxSchema = MailboxBaseSchema
    .extend({
      _id: z.coerce.string(),
       operators: z.array(z.object({_id: z.coerce.string(), name: z.string()})).optional()
    })

export default MailboxSchema;
export {MailboxSchema, MailboxBaseSchema}
