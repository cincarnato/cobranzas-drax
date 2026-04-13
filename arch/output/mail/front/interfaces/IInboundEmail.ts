
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
    category?: string
    sentiment?: string
    urgency?: string
    summary?: string
    tags?: Array<string>
    aiModel?: string
    extractedData?: {    affiliateName?: string
    affiliateDocumentNumber?: string
    affiliateCuil?: string
    affiliateEmail?: string
    affiliatePhone?: string
    affiliate?: any
    extractedEntities?: Array<{
    label: string
    value?: string
    source?: string
    confidence?: number
    }>}
    processingStatus: string
    reviewStatus?: string
    needsHumanReview?: boolean
    autoApproved?: boolean
    isDuplicate?: boolean
    duplicateOfMessageId?: string
    rejectionReason?: string
    validationNotes?: string
    rawExtractionJson?: string
    processedAt?: Date
    lastErrorAt?: Date
    lastErrorMessage?: string
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
    category?: string
    sentiment?: string
    urgency?: string
    summary?: string
    tags?: Array<string>
    aiModel?: string
    extractedData?: {    affiliateName?: string
    affiliateDocumentNumber?: string
    affiliateCuil?: string
    affiliateEmail?: string
    affiliatePhone?: string
    affiliate?: any
    extractedEntities?: Array<{
    label: string
    value?: string
    source?: string
    confidence?: number
    }>}
    processingStatus: string
    reviewStatus?: string
    needsHumanReview?: boolean
    autoApproved?: boolean
    isDuplicate?: boolean
    duplicateOfMessageId?: string
    rejectionReason?: string
    validationNotes?: string
    rawExtractionJson?: string
    processedAt?: Date
    lastErrorAt?: Date
    lastErrorMessage?: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
IInboundEmailBase, 
IInboundEmail
}
