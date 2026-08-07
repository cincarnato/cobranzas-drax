import type {IPayer} from "@/modules/transferencias/interfaces/IPayer";

interface ITransferEmailAffiliate {
  name?: string
  amount?: number
  email?: string
  documentNumber?: string
  month?: string
  observations?: string
}

type TransferEmailAffiliateStrategy = 'EMAIL_FROM' | 'DNI_CUIL' | 'CBU_CVU' | 'NRO_CUENTA' | 'EMAIL_DATA'
type TransferEmailAiStatus =
  'PENDIENTE'
  | 'PROCESADO_CONFIABLE'
  | 'PROCESADO_CON_DUDAS'
  | 'PROCESADO_INCOMPLETO'
  | 'PROCESADO_SIN_IA'
  | 'ERROR_PROCESAMIENTO'
type TransferEmailHumanStatus = 'PENDIENTE' | 'VALIDADO' | 'CORREGIDO' | 'DESCARTADO'
type TransferEmailStatus = 'PENDIENTE_IA' | 'PENDIENTE_AUDITORIA' | 'AUDITADO'

interface ITransferEmailBase {
  inboundEmail?: any
  payer?: IPayer | string | null
  emailMessageId?: string
  emailSubject?: string
  emailFromName?: string
  emailFromEmail?: string
  emailDocumentNumber?: string
  isTransferProof?: boolean
  amount?: number
  currency?: string
  transferDate?: Date | null
  emailDate?: Date
  processDate?: Date
  operationNumber?: string
  concept?: string
  originName?: string
  originAccount?: string
  originCbu?: string
  originAlias?: string
  originBank?: string
  destinationName?: string
  destinationAccount?: string
  destinationCbu?: string
  destinationAlias?: string
  destinationBank?: string
  affiliateStrategy?: TransferEmailAffiliateStrategy
  affiliates?: ITransferEmailAffiliate[]
  aiStatus?: TransferEmailAiStatus
  aiProcessedAt?: Date
  aiError?: string
  humanStatus?: TransferEmailHumanStatus
  assignedTo?: any
  auditSessionId?: any
  assignedAt?: Date
  assignmentExpiresAt?: Date
  lastActivityAt?: Date
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
  payer?: IPayer | string | null
  emailMessageId?: string
  emailSubject?: string
  emailFromName?: string
  emailFromEmail?: string
  emailDocumentNumber?: string
  isTransferProof?: boolean
  amount?: number
  currency?: string
  transferDate?: Date | null
  emailDate?: Date
  processDate?: Date
  operationNumber?: string
  concept?: string
  originName?: string
  originAccount?: string
  originCbu?: string
  originAlias?: string
  originBank?: string
  destinationName?: string
  destinationAccount?: string
  destinationCbu?: string
  destinationAlias?: string
  destinationBank?: string
  affiliateStrategy?: TransferEmailAffiliateStrategy
  affiliates?: ITransferEmailAffiliate[]
  aiStatus?: TransferEmailAiStatus
  aiProcessedAt?: Date
  aiError?: string
  humanStatus?: TransferEmailHumanStatus
  assignedTo?: any
  auditSessionId?: any
  assignedAt?: Date
  assignmentExpiresAt?: Date
  lastActivityAt?: Date
  auditedBy?: any
  auditedAt?: Date
  status?: TransferEmailStatus
  needsHumanReview?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export type {
  ITransferEmailAffiliate,
  TransferEmailAffiliateStrategy,
  TransferEmailAiStatus,
  TransferEmailHumanStatus,
  TransferEmailStatus,
  ITransferEmailBase,
  ITransferEmail
}
