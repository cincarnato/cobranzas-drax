
interface ITransferEmailAdditionalAffiliate {
    name?: string
    email?: string
    documentNumber?: string
}

type TransferEmailAffiliateStrategy = 'EMAIL_FROM' | 'DNI_CUIL' | 'CBU_CVU' | 'NRO_CUENTA' | 'EMAIL_DATA'

interface ITransferEmailBase {
    inboundEmail?: any
    emailMessageId?: string
    emailSubject?: string
    emailFromName?: string
    emailFromEmail?: string
    emailDocumentNumber?: string
    isTransferProof?: boolean
    amount?: number
    currency?: string
    transferDate?: Date
    emailDate?: Date
    processDate?: Date
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
    affiliateStrategy?: TransferEmailAffiliateStrategy
    additionalAffiliates?: ITransferEmailAdditionalAffiliate[]
    month?: string
    observations?: string
    needsHumanReview?: boolean
    createdAt?: Date
    updatedAt?: Date
}

interface ITransferEmail {
    _id: string
    inboundEmail?: any
    emailMessageId?: string
    emailSubject?: string
    emailFromName?: string
    emailFromEmail?: string
    emailDocumentNumber?: string
    isTransferProof?: boolean
    amount?: number
    currency?: string
    transferDate?: Date
    emailDate?: Date
    processDate?: Date
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
    affiliateStrategy?: TransferEmailAffiliateStrategy
    additionalAffiliates?: ITransferEmailAdditionalAffiliate[]
    month?: string
    observations?: string
    needsHumanReview?: boolean
    createdAt?: Date
    updatedAt?: Date
}

export type {
ITransferEmailAdditionalAffiliate,
TransferEmailAffiliateStrategy,
ITransferEmailBase, 
ITransferEmail
}
