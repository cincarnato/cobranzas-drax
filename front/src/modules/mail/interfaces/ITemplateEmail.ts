
interface ITemplateEmailBase {
    mailbox: any
    name: string
    content: string
    createdAt?: Date
    updatedAt?: Date
}

interface ITemplateEmail {
    _id: string
    mailbox: any
    name: string
    content: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
ITemplateEmailBase, 
ITemplateEmail
}
