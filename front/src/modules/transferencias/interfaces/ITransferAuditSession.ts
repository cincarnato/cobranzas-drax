import type {ITransferEmail} from "./ITransferEmail";

type TransferAuditSessionStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED'

interface ITransferAuditSession {
  _id: string
  operator?: any
  status: TransferAuditSessionStatus
  startedAt: Date | string
  pausedAt?: Date | string | null
  completedAt?: Date | string | null
  lastActivityAt?: Date | string | null
  expiresAt?: Date | string | null
  batchSize: number
  assignedCount: number
  auditedCount: number
  validatedCount: number
  correctedCount: number
  discardedCount: number
  referredCount: number
}

interface ITransferAuditSessionStats {
  assignedCount: number
  auditedCount: number
  pendingCount: number
  validatedCount: number
  correctedCount: number
  discardedCount: number
  referredCount: number
}

interface ITransferAuditSessionState {
  session: ITransferAuditSession | null
  items: ITransferEmail[]
  currentItemId: string | null
  stats: ITransferAuditSessionStats
}

export type {
  TransferAuditSessionStatus,
  ITransferAuditSession,
  ITransferAuditSessionStats,
  ITransferAuditSessionState
}
