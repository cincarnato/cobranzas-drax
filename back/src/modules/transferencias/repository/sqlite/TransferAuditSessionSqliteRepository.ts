import {AbstractSqliteRepository} from "@drax/crud-back";
import type {ITransferAuditSessionRepository} from "../../interfaces/ITransferAuditSessionRepository";
import type {ITransferAuditSession, ITransferAuditSessionBase} from "../../interfaces/ITransferAuditSession";

class TransferAuditSessionSqliteRepository extends AbstractSqliteRepository<ITransferAuditSession, ITransferAuditSessionBase, ITransferAuditSessionBase> implements ITransferAuditSessionRepository {
    protected tableName: string = 'TransferAuditSession';

    constructor(dbFile: string, autoBuild = true) {
        super(dbFile, autoBuild);
    }

    async findOperatorOpenSession(): Promise<ITransferAuditSession | null> {
        throw new Error('Transfer audit sessions are only supported with MongoDB')
    }

    async updateActivity(): Promise<ITransferAuditSession | null> {
        throw new Error('Transfer audit sessions are only supported with MongoDB')
    }

    async updateStatus(): Promise<ITransferAuditSession | null> {
        throw new Error('Transfer audit sessions are only supported with MongoDB')
    }

    async incrementAssignedCount(): Promise<ITransferAuditSession | null> {
        throw new Error('Transfer audit sessions are only supported with MongoDB')
    }

    async refreshCounters(): Promise<ITransferAuditSession | null> {
        throw new Error('Transfer audit sessions are only supported with MongoDB')
    }
}

export default TransferAuditSessionSqliteRepository
export {TransferAuditSessionSqliteRepository}
