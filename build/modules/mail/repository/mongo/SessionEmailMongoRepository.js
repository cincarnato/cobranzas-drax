import { AbstractMongoRepository } from "@drax/crud-back";
import { mongoose } from "@drax/common-back";
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
    async dailyStatsByMailbox(mailboxId, from, to) {
        const rows = await SessionEmailModel.aggregate([
            {
                $match: {
                    mailbox: new mongoose.Types.ObjectId(mailboxId),
                    startedAt: { $gte: from, $lt: to },
                },
            },
            {
                $group: {
                    _id: "$user",
                    sessionCount: { $sum: 1 },
                    assignedCount: { $sum: { $ifNull: ["$assignedCount", 0] } },
                    repliedCount: { $sum: { $ifNull: ["$repliedCount", 0] } },
                    closedCount: { $sum: { $ifNull: ["$closedCount", 0] } },
                    durationMs: {
                        $sum: {
                            $max: [
                                { $subtract: [{ $ifNull: ["$endedAt", "$$NOW"] }, "$startedAt"] },
                                0,
                            ],
                        },
                    },
                    firstStartedAt: { $min: "$startedAt" },
                    lastEndedAt: { $max: "$endedAt" },
                    lastActivityAt: { $max: "$lastActivityAt" },
                },
            },
            { $sort: { closedCount: -1, repliedCount: -1, assignedCount: -1 } },
        ]).exec();
        return rows.map((row) => ({
            userId: row._id?.toString() || "",
            sessionCount: Number(row.sessionCount || 0),
            assignedCount: Number(row.assignedCount || 0),
            repliedCount: Number(row.repliedCount || 0),
            closedCount: Number(row.closedCount || 0),
            durationMs: Number(row.durationMs || 0),
            firstStartedAt: row.firstStartedAt || null,
            lastEndedAt: row.lastEndedAt || null,
            lastActivityAt: row.lastActivityAt || null,
        }));
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
