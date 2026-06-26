import { AbstractSqliteRepository } from "@drax/crud-back";
class TransferAuditSessionSqliteRepository extends AbstractSqliteRepository {
    constructor(dbFile, autoBuild = true) {
        super(dbFile, autoBuild);
        this.tableName = 'TransferAuditSession';
    }
    async findOperatorOpenSession() {
        throw new Error('Transfer audit sessions are only supported with MongoDB');
    }
    async updateActivity() {
        throw new Error('Transfer audit sessions are only supported with MongoDB');
    }
    async updateStatus() {
        throw new Error('Transfer audit sessions are only supported with MongoDB');
    }
    async incrementAssignedCount() {
        throw new Error('Transfer audit sessions are only supported with MongoDB');
    }
    async refreshCounters() {
        throw new Error('Transfer audit sessions are only supported with MongoDB');
    }
}
export default TransferAuditSessionSqliteRepository;
export { TransferAuditSessionSqliteRepository };
