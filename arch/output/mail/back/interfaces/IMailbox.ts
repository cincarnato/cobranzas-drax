
interface IMailboxBase {
    name: string
    email: string
    username: string
    password: string
    isActive?: boolean
    autoProcessEnabled?: boolean
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
    isActive?: boolean
    autoProcessEnabled?: boolean
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
