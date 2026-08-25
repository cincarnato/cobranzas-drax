import {z} from 'zod';

const UserLiteSchema = z.object({
    _id: z.coerce.string(),
    name: z.string().optional(),
    username: z.string().optional(),
    email: z.string().optional()
});

const EmailUserStateLiteSchema = z.object({
    _id: z.coerce.string().optional(),
    isRead: z.boolean().optional().default(false),
    readAt: z.coerce.date().optional().nullable(),
    isStarred: z.boolean().optional().default(false),
});

const InboundEmailAttachmentSchema = z.object({
    filename: z.string().optional(),
    filepath: z.string().optional(),
    size: z.number().optional(),
    mimetype: z.string().optional(),
    url: z.string().optional()
});

const InboundEmailBaseSchema = z.object({
    messageId: z.string().min(1, 'validation.required'),
    threadId: z.string().optional(),
    inReplyTo: z.string().optional(),
    references: z.array(z.string()).optional(),
    parentInboundEmail: z.coerce.string().optional().nullable(),
    mailbox: z.string().optional(),
    imapUid: z.number().optional(),
    sourceChannel: z.enum(['EMAIL', 'FORWARDED_EMAIL', 'MANUAL_UPLOAD', 'API']).default('EMAIL'),
    receivedAt: z.coerce.date({error: "validation.date"}),
    subject: z.string().optional(),
    fromName: z.string().optional(),
    fromEmail: z.string().optional(),
    toEmails: z.array(z.string()).optional(),
    ccEmails: z.array(z.string()).optional(),
    replyToEmail: z.string().optional(),
    assignedTo: z.coerce.string().optional().nullable(),
    assignedAt: z.coerce.date().nullable().optional(),
    assignedSession: z.coerce.string().optional().nullable(),
    assignmentMode: z.enum(['MANUAL', 'AUTO']).optional().nullable(),
    attentionStatus: z.enum(['PENDING', 'ASSIGNED', 'CLOSED']).default('PENDING'),
    replyCount: z.number().nullable().optional().default(0),
    firstRepliedAt: z.coerce.date().nullable().optional(),
    lastRepliedAt: z.coerce.date().nullable().optional(),
    closedAt: z.coerce.date().nullable().optional(),
    closedBy: z.coerce.string().optional().nullable(),
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
    attachmentsOcrText: z.string().optional(),
    attachmentsOcrError: z.string().optional(),
    category: z.string().nullable().optional(),
    closeReason: z.string().nullable().optional(),
    sentiment: z.string().nullable().optional(),
    priority: z.string().nullable().optional(),
    summary: z.string().optional(),
    tags: z.array(z.string()).optional(),
    aiModel: z.string().optional(),
    customer: z.object({
        name: z.string().optional(),
        documentNumber: z.string().optional(),
        cuil: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional()
    }),
    extractedEntities: z.array(
        z.object({
            label: z.string().min(1, 'validation.required'),
            value: z.string().optional(),
            source: z.enum(['SUBJECT', 'BODY', 'ATTACHMENT', 'MANUAL']).optional(),
            confidence: z.number().nullable().optional()
        })
    ).optional(),
    processingStatus: z.enum(['PENDING', 'PROCESSING', 'PROCESSED', 'REVIEW_REQUIRED', 'REJECTED', 'ERROR']).default('PENDING'),
    reviewStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CORRECTED']).optional().default('PENDING'),
    processMarks: z.array(z.object({
        key: z.string().min(1, 'validation.required'),
        status: z.enum(['PROCESSING', 'SUCCESS', 'FAILED', 'SKIPPED']),
        markedAt: z.coerce.date({error: "validation.date"}),
        attempts: z.number().optional(),
        lastError: z.string().optional(),
        metadata: z.record(z.string(), z.unknown()).optional().nullable(),
    })).optional(),
    isDuplicate: z.boolean().optional(),
    duplicateOfMessageId: z.string().optional(),
    processedAt: z.coerce.date().nullable().optional()
});

const InboundEmailSchema = InboundEmailBaseSchema
    .extend({
        _id: z.coerce.string(),
        assignedTo: z.object({
            _id: z.coerce.string(),
            name: z.string().optional(),
            username: z.string().optional(),
            email: z.string().optional()
        }).nullable().optional(),
        closedBy: z.object({_id: z.coerce.string(), name: z.string().optional(), username: z.string().optional(), email: z.string().optional()}).nullable().optional(),
        assignedSession: z.any().nullable().optional(),

    })

const InboundEmailManagementListItemSchema = z.object({
    _id: z.coerce.string(),
    receivedAt: z.coerce.date({error: "validation.date"}),
    subject: z.string().optional(),
    fromName: z.string().optional(),
    fromEmail: z.string().optional(),
    assignedTo: UserLiteSchema.nullable().optional(),
    assignedAt: z.coerce.date().nullable().optional(),
    assignmentMode: z.enum(['MANUAL', 'AUTO']).optional().nullable(),
    attentionStatus: z.enum(['PENDING', 'ASSIGNED', 'CLOSED']).default('PENDING'),
    replyCount: z.number().nullable().optional().default(0),
    hasAttachments: z.boolean().optional(),
    attachmentCount: z.number().nullable().optional(),
    attachmentsOcrError: z.string().optional(),
    category: z.string().nullable().optional(),
    sentiment: z.string().nullable().optional(),
    priority: z.string().nullable().optional(),
    summary: z.string().optional(),
    tags: z.array(z.string()).optional(),
    processingStatus: z.enum(['PENDING', 'PROCESSING', 'PROCESSED', 'REVIEW_REQUIRED', 'REJECTED', 'ERROR']).default('PENDING'),
    isDuplicate: z.boolean().optional(),
    userState: EmailUserStateLiteSchema.nullable().optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
});

const InboundEmailManagementListResultSchema = z.object({
    items: z.array(InboundEmailManagementListItemSchema),
    page: z.number(),
    pageSize: z.number(),
    totalItems: z.number(),
    totalPages: z.number(),
});

const MailboxManagementSchema = z.object({
    _id: z.coerce.string(),
    name: z.string(),
    email: z.string(),
    categories: z.array(z.object({
        name: z.string(),
        description: z.string().optional(),
        managementUrl: z.string().optional()
    })).optional().default([]),
    closeReasons: z.array(z.object({
        name: z.string(),
        description: z.string().optional()
    })).optional().default([]),
    operators: z.array(UserLiteSchema).optional().default([]),
    sentiments: z.array(z.object({
        name: z.string(),
        emoji: z.string().optional(),
        description: z.string().optional()
    })).optional().default([]),
    priorities: z.array(z.object({
        name: z.string(),
        icon: z.string().optional(),
        color: z.string().optional(),
        description: z.string().optional()
    })).optional().default([]),
    replyRequiredToClose: z.boolean().optional().default(false),
    closeReasonRequired: z.boolean().optional().default(false),
});

const InboundEmailManagementDetailItemSchema = InboundEmailManagementListItemSchema.extend({
    messageId: z.string().optional(),
    threadId: z.string().optional(),
    inReplyTo: z.string().optional(),
    references: z.array(z.string()).optional(),
    parentInboundEmail: z.any().optional().nullable(),
    mailbox: z.string().optional(),
    sourceChannel: z.enum(['EMAIL', 'FORWARDED_EMAIL', 'MANUAL_UPLOAD', 'API']).optional(),
    toEmails: z.array(z.string()).optional(),
    ccEmails: z.array(z.string()).optional(),
    replyToEmail: z.string().optional(),
    firstRepliedAt: z.coerce.date().nullable().optional(),
    lastRepliedAt: z.coerce.date().nullable().optional(),
    closedAt: z.coerce.date().nullable().optional(),
    closedBy: UserLiteSchema.nullable().optional(),
    bodyText: z.string().optional(),
    bodyHtml: z.string().optional(),
    attachments: z.array(InboundEmailAttachmentSchema).optional(),
    closeReason: z.string().nullable().optional(),
    customer: z.object({
        name: z.string().optional(),
        documentNumber: z.string().optional(),
        cuil: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional()
    }).optional(),
    extractedEntities: z.array(z.object({
        label: z.string(),
        value: z.string().optional(),
        source: z.enum(['SUBJECT', 'BODY', 'ATTACHMENT', 'MANUAL']).optional(),
        confidence: z.number().nullable().optional()
    })).optional(),
});

const OutboundEmailManagementThreadItemSchema = z.object({
    _id: z.coerce.string(),
    inboundEmail: z.union([
        z.object({_id: z.coerce.string(), messageId: z.string().optional()}),
        z.coerce.string()
    ]).nullable().optional(),
    fromEmail: z.string(),
    toEmails: z.array(z.string()),
    ccEmails: z.array(z.string()).optional(),
    subject: z.string(),
    bodyText: z.string().optional(),
    bodyHtml: z.string().optional(),
    attachments: z.array(InboundEmailAttachmentSchema).optional(),
    status: z.enum(['DRAFT', 'QUEUED', 'SENDING', 'SENT', 'FAILED', 'CANCELLED']),
    messageId: z.string().optional(),
    inReplyTo: z.string().optional(),
    references: z.array(z.string()).optional(),
    sentAt: z.coerce.date().nullable().optional(),
    lastError: z.string().optional(),
    attempts: z.number().nullable().optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
});

const InboundEmailManagementDetailSchema = z.object({
    inboundEmail: InboundEmailManagementDetailItemSchema,
    mailbox: MailboxManagementSchema,
    assignedUser: UserLiteSchema.nullable().optional(),
    userState: EmailUserStateLiteSchema.nullable().optional(),
    inboundThread: z.array(InboundEmailManagementDetailItemSchema),
    outboundThread: z.array(OutboundEmailManagementThreadItemSchema),
});

export default InboundEmailSchema;
export {
    InboundEmailSchema,
    InboundEmailBaseSchema,
    InboundEmailManagementListItemSchema,
    InboundEmailManagementListResultSchema,
    InboundEmailManagementDetailSchema,
}
