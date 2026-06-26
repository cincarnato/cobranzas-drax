
import type {ITransferEmail, ITransferEmailBase} from './ITransferEmail'
import {IDraxCrudRepository} from "@drax/crud-share";

interface ITransferEmailRepository extends IDraxCrudRepository<ITransferEmail, ITransferEmailBase, ITransferEmailBase>{
    assignNextAvailable(operatorId: string, sessionId: string, assignedAt: Date, expiresAt: Date): Promise<ITransferEmail | null>
    findAssignedToSession(sessionId: string): Promise<ITransferEmail[]>
    releasePendingAssignments(sessionId: string, operatorId: string): Promise<number>
    renewAssignments(sessionId: string, operatorId: string, lastActivityAt: Date, expiresAt: Date): Promise<number>
    auditAssigned(id: string, operatorId: string, sessionId: string, now: Date, payload: Partial<ITransferEmailBase>): Promise<ITransferEmail | null>
}

export {ITransferEmailRepository}

