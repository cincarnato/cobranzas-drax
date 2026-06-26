type TransferAuditSessionStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED'

interface ITransferAuditSessionBase {
    operator?: any
    status?: TransferAuditSessionStatus
    startedAt?: Date
    pausedAt?: Date
    completedAt?: Date
    lastActivityAt?: Date
    expiresAt?: Date
    batchSize?: number
    assignedCount?: number
    auditedCount?: number
    validatedCount?: number
    correctedCount?: number
    discardedCount?: number
    referredCount?: number
    createdAt?: Date
    updatedAt?: Date
}

interface ITransferAuditSession extends ITransferAuditSessionBase {
    _id: string
}

export type {
    TransferAuditSessionStatus,
    ITransferAuditSessionBase,
    ITransferAuditSession
}
