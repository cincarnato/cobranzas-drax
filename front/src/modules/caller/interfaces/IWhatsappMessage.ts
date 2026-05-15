
interface IWhatsappMessageBase {
    sentAt: Date
    user: any
    destinationNumber: string
    template: string
    createdAt?: Date
    updatedAt?: Date
}

interface IWhatsappMessage {
    _id: string
    sentAt: Date
    user: any
    destinationNumber: string
    template: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
IWhatsappMessageBase, 
IWhatsappMessage
}
