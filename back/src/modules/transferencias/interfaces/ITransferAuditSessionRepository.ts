import type {IDraxCrudRepository} from "@drax/crud-share";
import type {
    ITransferAuditSession,
    ITransferAuditSessionBase
} from "./ITransferAuditSession";

interface ITransferAuditSessionRepository extends IDraxCrudRepository<ITransferAuditSession, ITransferAuditSessionBase, ITransferAuditSessionBase> {
    findOperatorOpenSession(operatorId: string): Promise<ITransferAuditSession | null>
    updateActivity(sessionId: string, operatorId: string, expiresAt: Date): Promise<ITransferAuditSession | null>
    updateStatus(sessionId: string, operatorId: string, status: ITransferAuditSession["status"], patch?: Partial<ITransferAuditSessionBase>): Promise<ITransferAuditSession | null>
    incrementAssignedCount(sessionId: string, count: number): Promise<ITransferAuditSession | null>
    refreshCounters(sessionId: string, counters: Partial<ITransferAuditSessionBase>): Promise<ITransferAuditSession | null>
}

export {ITransferAuditSessionRepository}
