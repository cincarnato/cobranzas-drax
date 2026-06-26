import {AbstractMongoRepository} from "@drax/crud-back";
import {TransferAuditSessionModel} from "../../models/TransferAuditSessionModel.js";
import type {ITransferAuditSessionRepository} from "../../interfaces/ITransferAuditSessionRepository";
import type {ITransferAuditSession, ITransferAuditSessionBase} from "../../interfaces/ITransferAuditSession";

class TransferAuditSessionMongoRepository extends AbstractMongoRepository<ITransferAuditSession, ITransferAuditSessionBase, ITransferAuditSessionBase> implements ITransferAuditSessionRepository {

    constructor() {
        super();
        this._model = TransferAuditSessionModel;
        this._searchFields = [];
        this._populateFields = ['operator'];
        this._lean = true
    }

    async findOperatorOpenSession(operatorId: string): Promise<ITransferAuditSession | null> {
        return await TransferAuditSessionModel.findOne({
            operator: operatorId,
            status: {$in: ['ACTIVE', 'PAUSED']},
        }).populate(this._populateFields).lean() as ITransferAuditSession | null
    }

    async updateActivity(sessionId: string, operatorId: string, expiresAt: Date): Promise<ITransferAuditSession | null> {
        return await TransferAuditSessionModel.findOneAndUpdate(
            {_id: sessionId, operator: operatorId, status: 'ACTIVE'},
            {$set: {lastActivityAt: new Date(), expiresAt}},
            {new: true}
        ).populate(this._populateFields).lean() as ITransferAuditSession | null
    }

    async updateStatus(sessionId: string, operatorId: string, status: ITransferAuditSession["status"], patch: Partial<ITransferAuditSessionBase> = {}): Promise<ITransferAuditSession | null> {
        return await TransferAuditSessionModel.findOneAndUpdate(
            {_id: sessionId, operator: operatorId},
            {$set: {status, ...patch}},
            {new: true}
        ).populate(this._populateFields).lean() as ITransferAuditSession | null
    }

    async incrementAssignedCount(sessionId: string, count: number): Promise<ITransferAuditSession | null> {
        return await TransferAuditSessionModel.findByIdAndUpdate(
            sessionId,
            {$inc: {assignedCount: count}},
            {new: true}
        ).populate(this._populateFields).lean() as ITransferAuditSession | null
    }

    async refreshCounters(sessionId: string, counters: Partial<ITransferAuditSessionBase>): Promise<ITransferAuditSession | null> {
        return await TransferAuditSessionModel.findByIdAndUpdate(
            sessionId,
            {$set: counters},
            {new: true}
        ).populate(this._populateFields).lean() as ITransferAuditSession | null
    }
}

export default TransferAuditSessionMongoRepository
export {TransferAuditSessionMongoRepository}
