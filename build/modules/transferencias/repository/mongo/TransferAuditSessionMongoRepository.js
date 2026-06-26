import { AbstractMongoRepository } from "@drax/crud-back";
import { TransferAuditSessionModel } from "../../models/TransferAuditSessionModel.js";
class TransferAuditSessionMongoRepository extends AbstractMongoRepository {
    constructor() {
        super();
        this._model = TransferAuditSessionModel;
        this._searchFields = [];
        this._populateFields = ['operator'];
        this._lean = true;
    }
    async findOperatorOpenSession(operatorId) {
        return await TransferAuditSessionModel.findOne({
            operator: operatorId,
            status: { $in: ['ACTIVE', 'PAUSED'] },
        }).populate(this._populateFields).lean();
    }
    async updateActivity(sessionId, operatorId, expiresAt) {
        return await TransferAuditSessionModel.findOneAndUpdate({ _id: sessionId, operator: operatorId, status: 'ACTIVE' }, { $set: { lastActivityAt: new Date(), expiresAt } }, { new: true }).populate(this._populateFields).lean();
    }
    async updateStatus(sessionId, operatorId, status, patch = {}) {
        return await TransferAuditSessionModel.findOneAndUpdate({ _id: sessionId, operator: operatorId }, { $set: { status, ...patch } }, { new: true }).populate(this._populateFields).lean();
    }
    async incrementAssignedCount(sessionId, count) {
        return await TransferAuditSessionModel.findByIdAndUpdate(sessionId, { $inc: { assignedCount: count } }, { new: true }).populate(this._populateFields).lean();
    }
    async refreshCounters(sessionId, counters) {
        return await TransferAuditSessionModel.findByIdAndUpdate(sessionId, { $set: counters }, { new: true }).populate(this._populateFields).lean();
    }
}
export default TransferAuditSessionMongoRepository;
export { TransferAuditSessionMongoRepository };
