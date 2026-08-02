
interface IMailboxUserSettingBase {
    mailbox: any
    user: any
    signatureHtml?: string
    signatureText?: string
    createdAt?: Date
    updatedAt?: Date
}

interface IMailboxUserSetting {
    _id: string
    mailbox: any
    user: any
    signatureHtml?: string
    signatureText?: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
IMailboxUserSettingBase, 
IMailboxUserSetting
}
