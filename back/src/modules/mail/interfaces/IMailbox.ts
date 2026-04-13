
interface IMailboxBase {
    name: string
    email: string
    username: string
    password: string
    categories?: Array<{
        name: string
        description?: string
    }>
    entities?: Array<{
        name: string
        description?: string
    }>
    sentiments?: Array<string>
    priorities?: Array<string>
    tags?: Array<string>
    isActive?: boolean
    autoProcessEnabled?: boolean
    attachmentStorageEnabled?: boolean
    attachmentOcrEnabled?: boolean
    processingProtocol?: string
    processingIntervalMinutes?: number
    imapEnabled?: boolean
    imapHost?: string
    imapPort?: number
    imapTls?: boolean
    popEnabled?: boolean
    popHost?: string
    popPort?: number
    popTls?: boolean
    smtpEnabled?: boolean
    smtpHost?: string
    smtpPort?: number
    smtpTls?: boolean
    createdAt?: Date
    updatedAt?: Date
}

interface IMailbox {
    _id: string
    name: string
    email: string
    username: string
    password: string
    categories?: Array<{
        name: string
        description?: string
    }>
    entities?: Array<{
        name: string
        description?: string
    }>
    sentiments?: Array<string>
    priorities?: Array<string>
    tags?: Array<string>
    isActive?: boolean
    autoProcessEnabled?: boolean
    attachmentStorageEnabled?: boolean
    attachmentOcrEnabled?: boolean
    processingProtocol?: string
    processingIntervalMinutes?: number
    imapEnabled?: boolean
    imapHost?: string
    imapPort?: number
    imapTls?: boolean
    popEnabled?: boolean
    popHost?: string
    popPort?: number
    popTls?: boolean
    smtpEnabled?: boolean
    smtpHost?: string
    smtpPort?: number
    smtpTls?: boolean
    createdAt?: Date
    updatedAt?: Date
}

export type {
IMailboxBase, 
IMailbox
}
