import {z} from 'zod';


const MailboxBaseSchema = z.object({
    name: z.string().min(1, 'validation.required'),
    email: z.string().min(1, 'validation.required'),
    username: z.string().min(1, 'validation.required'),
    password: z.string().min(1, 'validation.required'),
    categories: z.array(z.object({
        name: z.string().min(1, 'validation.required'),
        description: z.string().optional().default(''),
        managementUrl: z.string().optional().default('')
    })).optional().default([]),
    closeReasons: z.array(z.object({
        name: z.string().min(1, 'validation.required'),
        description: z.string().optional()
    })).optional().default([]),
    entities: z.array(z.object({
        name: z.string().min(1, 'validation.required'),
        description: z.string().optional()
    })).optional().default([]),
    operators: z.array(z.coerce.string()).optional().default([]),
    maxAssignableEmailsPerUser: z.number().nullable().optional().default(null),
    sentiments: z.array(z.object({
        name: z.string().min(1, 'validation.required'),
        emoji: z.string().optional().default(''),
        description: z.string().optional().default('')
    })).optional().default([]),
    priorities: z.array(z.object({
        name: z.string().min(1, 'validation.required'),
        icon: z.string().optional().default(''),
        color: z.string().optional().default(''),
        description: z.string().optional().default('')
    })).optional().default([]),
    tags: z.array(z.string()).optional().default([]),
    aiAnalysisEnabled: z.boolean().optional().default(true),
    isActive: z.boolean().optional(),
    autoProcessEnabled: z.boolean().optional(),
    replyRequiredToClose: z.boolean().optional().default(false),
    closeReasonRequired: z.boolean().optional().default(false),
    attachmentStorageEnabled: z.boolean().optional().default(true),
    attachmentOcrEnabled: z.boolean().optional().default(false),
    retentionDays: z.number().nullable().optional().default(null),
    processingProtocol: z.enum(['IMAP', 'POP']).optional().default('IMAP'),
    processingIntervalMinutes: z.number().nullable().optional().default(5),
    imapEnabled: z.boolean().optional(),
    imapHost: z.string().optional().default(''),
    imapPort: z.number().nullable().optional().default(993),
    imapTls: z.boolean().optional(),
    popEnabled: z.boolean().optional(),
    popHost: z.string().optional().default(''),
    popPort: z.number().nullable().optional().default(995),
    popTls: z.boolean().optional(),
    smtpEnabled: z.boolean().optional(),
    smtpHost: z.string().optional().default(''),
    smtpPort: z.number().nullable().optional().default(465),
    smtpTls: z.boolean().optional()
});

const MailboxSchema = MailboxBaseSchema
    .extend({
        _id: z.coerce.string(),
        operators: z.array(z.object({
            _id: z.coerce.string(),
            name: z.string().optional(),
            username: z.string().optional(),
            email: z.string().optional()
        })).optional().default([]),

    })

export default MailboxSchema;
export {MailboxSchema, MailboxBaseSchema}
