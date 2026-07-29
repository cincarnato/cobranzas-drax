
interface IMailboxSentimentOption {
    name: string
    emoji?: string
    description?: string
}

interface IMailboxPriorityOption {
    name: string
    icon?: string
    color?: string
    description?: string
}

interface IMailboxBase {
    name: string
    email: string
    username: string
    password: string
    categories?: Array<{
        name: string
        description?: string
        managementUrl?: string
    }>
    closeReasons?: Array<{
        name: string
        description?: string
    }>
    entities?: Array<{
        name: string
        description?: string
    }>
    operators?: Array<string | any>
    maxAssignableEmailsPerUser?: number | null
    sentiments?: Array<IMailboxSentimentOption>
    priorities?: Array<IMailboxPriorityOption>
    tags?: Array<string>
    aiAnalysisEnabled?: boolean
    isActive?: boolean
    autoProcessEnabled?: boolean
    replyRequiredToClose?: boolean
    closeReasonRequired?: boolean
    attachmentStorageEnabled?: boolean
    attachmentOcrEnabled?: boolean
    retentionDays?: number | null
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
        managementUrl?: string
    }>
    closeReasons?: Array<{
        name: string
        description?: string
    }>
    entities?: Array<{
        name: string
        description?: string
    }>
    operators?: Array<string | any>
    maxAssignableEmailsPerUser?: number | null
    sentiments?: Array<IMailboxSentimentOption>
    priorities?: Array<IMailboxPriorityOption>
    tags?: Array<string>
    aiAnalysisEnabled?: boolean
    isActive?: boolean
    autoProcessEnabled?: boolean
    replyRequiredToClose?: boolean
    closeReasonRequired?: boolean
    attachmentStorageEnabled?: boolean
    attachmentOcrEnabled?: boolean
    retentionDays?: number | null
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
IMailbox,
IMailboxSentimentOption,
IMailboxPriorityOption
}
