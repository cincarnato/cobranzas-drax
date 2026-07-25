import type {IDraxCrudRepository} from "@drax/crud-share";
import type {ISessionEmail, ISessionEmailBase, SessionEmailStatus} from "./ISessionEmail";

interface ISessionEmailRepository extends IDraxCrudRepository<ISessionEmail, ISessionEmailBase, ISessionEmailBase> {
    findUserOpenSession(mailboxId: string, userId: string): Promise<ISessionEmail | null>
    findUserActiveSession(mailboxId: string, userId: string): Promise<ISessionEmail | null>
    createOpenSession(data: ISessionEmailBase): Promise<ISessionEmail>
    updateStatus(sessionId: string, userId: string, status: SessionEmailStatus, patch?: Partial<ISessionEmailBase>): Promise<ISessionEmail | null>
    updateActivity(sessionId: string): Promise<ISessionEmail | null>
    incrementAssignedCount(sessionId: string, count: number): Promise<ISessionEmail | null>
    incrementClosedCount(sessionId: string): Promise<ISessionEmail | null>
    incrementRepliedOnce(sessionId: string, inboundEmailId: string): Promise<ISessionEmail | null>
    acquireCapacityFillLock(sessionId: string, lockUntil: Date): Promise<ISessionEmail | null>
    releaseCapacityFillLock(sessionId: string): Promise<void>
}

export {ISessionEmailRepository}
