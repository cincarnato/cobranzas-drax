
interface ITransferEmailBase {
    inboundEmail?: any
    isTransferProof?: boolean
    amount?: number
    currency?: string
    transferDate?: Date
    operationNumber?: string
    concept?: string
    originAccount?: string
    originCbu?: string
    originAlias?: string
    originBank?: string
    destinationAccount?: string
    destinationCbu?: string
    destinationAlias?: string
    destinationBank?: string
    affiliateName?: string
    affiliateEmail?: string
    affiliateDocumentNumber?: string
    needsHumanReview?: boolean
    createdAt?: Date
    updatedAt?: Date
}

interface ITransferEmail {
    _id: string
    inboundEmail?: any
    isTransferProof?: boolean
    amount?: number
    currency?: string
    transferDate?: Date
    operationNumber?: string
    concept?: string
    originAccount?: string
    originCbu?: string
    originAlias?: string
    originBank?: string
    destinationAccount?: string
    destinationCbu?: string
    destinationAlias?: string
    destinationBank?: string
    affiliateName?: string
    affiliateEmail?: string
    affiliateDocumentNumber?: string
    needsHumanReview?: boolean
    createdAt?: Date
    updatedAt?: Date
}

export type {
ITransferEmailBase, 
ITransferEmail
}
