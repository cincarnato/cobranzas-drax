import { AbstractMongoRepository } from "@drax/crud-back";
import { SessionEmailModel } from "../../models/SessionEmailModel.js";
class SessionEmailMongoRepository extends AbstractMongoRepository {
    constructor() {
        super();
        this._model = SessionEmailModel;
        this._searchFields = [];
        this._populateFields = ['mailbox', 'user'];
        this._lean = true;
    }
    async findUserOpenSession(mailboxId, userId) {
        return await SessionEmailModel.findOne({
            mailbox: mailboxId,
            user: userId,
            status: { $in: ['ACTIVE', 'PAUSED'] },
        }).populate(this._populateFields).lean();
    }
    async findUserActiveSession(mailboxId, userId) {
        return await SessionEmailModel.findOne({
            mailbox: mailboxId,
            user: userId,
            status: 'ACTIVE',
        }).populate(this._populateFields).lean();
    }
    async findOpenByMailbox(mailboxId) {
        return await SessionEmailModel.find({
            mailbox: mailboxId,
            status: { $in: ['ACTIVE', 'PAUSED'] },
        }).populate(this._populateFields).lean();
    }
    async createOpenSession(data) {
        return await SessionEmailModel.create(data);
    }
    async updateStatus(sessionId, userId, status, patch = {}) {
        const now = new Date();
        return await SessionEmailModel.findOneAndUpdate({
            _id: sessionId,
            user: userId,
            $or: [
                { capacityFillLockedUntil: { $exists: false } },
                { capacityFillLockedUntil: null },
                { capacityFillLockedUntil: { $lte: now } },
            ],
        }, { $set: { status, ...patch } }, { new: true }).populate(this._populateFields).lean();
    }
    async updateActivity(sessionId) {
        return await SessionEmailModel.findByIdAndUpdate(sessionId, { $set: { lastActivityAt: new Date() } }, { new: true }).populate(this._populateFields).lean();
    }
    async incrementAssignedCount(sessionId, count) {
        return await SessionEmailModel.findByIdAndUpdate(sessionId, { $inc: { assignedCount: count }, $set: { lastActivityAt: new Date() } }, { new: true }).populate(this._populateFields).lean();
    }
    async incrementClosedCount(sessionId) {
        return await SessionEmailModel.findByIdAndUpdate(sessionId, { $inc: { closedCount: 1 }, $set: { lastActivityAt: new Date() } }, { new: true }).populate(this._populateFields).lean();
    }
    async incrementRepliedOnce(sessionId, inboundEmailId) {
        return await SessionEmailModel.findOneAndUpdate({ _id: sessionId, sessionRepliedInboundEmails: { $ne: inboundEmailId } }, {
            $addToSet: { sessionRepliedInboundEmails: inboundEmailId },
            $inc: { repliedCount: 1 },
            $set: { lastActivityAt: new Date() },
        }, { new: true }).populate(this._populateFields).lean();
    }
    async acquireCapacityFillLock(sessionId, lockUntil) {
        const now = new Date();
        return await SessionEmailModel.findOneAndUpdate({
            _id: sessionId,
            status: 'ACTIVE',
            $or: [
                { capacityFillLockedUntil: { $exists: false } },
                { capacityFillLockedUntil: null },
                { capacityFillLockedUntil: { $lte: now } },
            ],
        }, { $set: { capacityFillLockedUntil: lockUntil } }, { new: true }).populate(this._populateFields).lean();
    }
    async releaseCapacityFillLock(sessionId) {
        await SessionEmailModel.updateOne({ _id: sessionId }, { $set: { capacityFillLockedUntil: null } }).exec();
    }
}
export default SessionEmailMongoRepository;
export { SessionEmailMongoRepository };
