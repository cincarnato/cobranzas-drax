interface IInboundEmailBase {
    messageId: string
    threadId?: string
    mailbox?: string
    sourceChannel: string
    receivedAt: Date
    subject?: string
    fromName?: string
    fromEmail?: string
    toEmails?: Array<string>
    ccEmails?: Array<string>
    replyToEmail?: string
    bodyText?: string
    bodyHtml?: string
    normalizedText?: string
    hasAttachments?: boolean
    attachmentCount?: number
    attachments?: Array<{
        filename: string,
        filepath: string,
        size: number,
        mimetype?: string,
        url: string
    }>
    attachmentsOcrText?: string
    category?: string
    sentiment?: string
    priority?: string
    summary?: string
    tags?: Array<string>
    aiModel?: string
    customer?: {
        name?: string
        documentNumber?: string
        cuil?: string
        email?: string
        phone?: string
    }
    extractedEntities?: Array<{
        label: string
        value?: string
        source?: string
        confidence?: number
    }>
    processingStatus: string
    reviewStatus?: string
    isDuplicate?: boolean
    duplicateOfMessageId?: string
    processedAt?: Date
    createdAt?: Date
    updatedAt?: Date
}

interface IInboundEmail {
    _id: string
    messageId: string
    threadId?: string
    mailbox?: string
    sourceChannel: string
    receivedAt: Date
    subject?: string
    fromName?: string
    fromEmail?: string
    toEmails?: Array<string>
    ccEmails?: Array<string>
    replyToEmail?: string
    bodyText?: string
    bodyHtml?: string
    normalizedText?: string
    hasAttachments?: boolean
    attachmentCount?: number
    attachments?: Array<{
        filename: string,
        filepath: string,
        size: number,
        mimetype?: string,
        url: string
    }>
    attachmentsOcrText?: string
    category?: string
    sentiment?: string
    priority?: string
    summary?: string
    tags?: Array<string>
    aiModel?: string
    customer?: {
        name?: string
        documentNumber?: string
        cuil?: string
        email?: string
        phone?: string
    }
    extractedEntities?: Array<{
        label: string
        value?: string
        source?: string
        confidence?: number
    }>
    processingStatus: string
    reviewStatus?: string
    isDuplicate?: boolean
    duplicateOfMessageId?: string
    processedAt?: Date
    createdAt?: Date
    updatedAt?: Date
}

export type {
    IInboundEmailBase,
    IInboundEmail
}
