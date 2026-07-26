
interface IOutboundEmailBase {
    inboundEmail?: any
    mailbox: any
    user?: any
    fromEmail: string
    toEmails: Array<string>
    ccEmails?: Array<string>
    bccEmails?: Array<string>
    subject: string
    bodyText?: string
    bodyHtml?: string
    status: string
    messageId?: string
    inReplyTo?: string
    references?: Array<string>
    sentAt?: Date
    lastError?: string
    attempts?: number
    createdAt?: Date
    updatedAt?: Date
}

interface IOutboundEmail {
    _id: string
    inboundEmail?: any
    mailbox: any
    user?: any
    fromEmail: string
    toEmails: Array<string>
    ccEmails?: Array<string>
    bccEmails?: Array<string>
    subject: string
    bodyText?: string
    bodyHtml?: string
    status: string
    messageId?: string
    inReplyTo?: string
    references?: Array<string>
    sentAt?: Date
    lastError?: string
    attempts?: number
    createdAt?: Date
    updatedAt?: Date
}

export type {
IOutboundEmailBase, 
IOutboundEmail
}
