
interface ITransferEmailAffiliate {
    name?: string
    amount?: number
    documentNumber?: string
    month?: string
    observations?: string
}

interface ITransferEmailAdditionalAffiliate {
    name?: string
    email?: string
    documentNumber?: string
}

type TransferEmailAffiliateStrategy = 'EMAIL_FROM' | 'DNI_CUIL' | 'CBU_CVU' | 'NRO_CUENTA' | 'EMAIL_DATA'
type TransferEmailAiStatus = 'PENDIENTE' | 'PROCESADO_CONFIABLE' | 'PROCESADO_CON_DUDAS' | 'PROCESADO_INCOMPLETO' | 'ERROR_PROCESAMIENTO'
type TransferEmailHumanStatus = 'PENDIENTE' | 'VALIDADO' | 'CORREGIDO' | 'DESCARTADO'
type TransferEmailStatus = 'PENDIENTE_IA' | 'PENDIENTE_AUDITORIA' | 'AUDITADO'

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
    affiliates?: ITransferEmailAffiliate[]
    aiStatus?: TransferEmailAiStatus
    aiProcessedAt?: Date
    aiError?: string
    humanStatus?: TransferEmailHumanStatus
    assignedTo?: any
    auditedBy?: any
    auditedAt?: Date
    status?: TransferEmailStatus
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
    affiliates?: ITransferEmailAffiliate[]
    aiStatus?: TransferEmailAiStatus
    aiProcessedAt?: Date
    aiError?: string
    humanStatus?: TransferEmailHumanStatus
    assignedTo?: any
    auditedBy?: any
    auditedAt?: Date
    status?: TransferEmailStatus
    needsHumanReview?: boolean
    createdAt?: Date
    updatedAt?: Date
}

export type {
ITransferEmailAffiliate,
ITransferEmailAdditionalAffiliate,
TransferEmailAffiliateStrategy,
TransferEmailAiStatus,
TransferEmailHumanStatus,
TransferEmailStatus,
ITransferEmailBase, 
ITransferEmail
}
