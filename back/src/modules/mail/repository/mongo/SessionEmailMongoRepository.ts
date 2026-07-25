import {AbstractMongoRepository} from "@drax/crud-back";
import {SessionEmailModel} from "../../models/SessionEmailModel.js";
import type {ISessionEmailRepository} from "../../interfaces/ISessionEmailRepository";
import type {ISessionEmail, ISessionEmailBase, SessionEmailStatus} from "../../interfaces/ISessionEmail";

class SessionEmailMongoRepository extends AbstractMongoRepository<ISessionEmail, ISessionEmailBase, ISessionEmailBase> implements ISessionEmailRepository {

    constructor() {
        super();
        this._model = SessionEmailModel;
        this._searchFields = [];
        this._populateFields = ['mailbox', 'user'];
        this._lean = true
    }

    async findUserOpenSession(mailboxId: string, userId: string): Promise<ISessionEmail | null> {
        return await SessionEmailModel.findOne({
            mailbox: mailboxId,
            user: userId,
            status: {$in: ['ACTIVE', 'PAUSED']},
        }).populate(this._populateFields).lean() as ISessionEmail | null
    }

    async findUserActiveSession(mailboxId: string, userId: string): Promise<ISessionEmail | null> {
        return await SessionEmailModel.findOne({
            mailbox: mailboxId,
            user: userId,
            status: 'ACTIVE',
        }).populate(this._populateFields).lean() as ISessionEmail | null
    }

    async createOpenSession(data: ISessionEmailBase): Promise<ISessionEmail> {
        return await SessionEmailModel.create(data) as ISessionEmail
    }

    async updateStatus(sessionId: string, userId: string, status: SessionEmailStatus, patch: Partial<ISessionEmailBase> = {}): Promise<ISessionEmail | null> {
        const now = new Date()
        return await SessionEmailModel.findOneAndUpdate(
            {
                _id: sessionId,
                user: userId,
                $or: [
                    {capacityFillLockedUntil: {$exists: false}},
                    {capacityFillLockedUntil: null},
                    {capacityFillLockedUntil: {$lte: now}},
                ],
            },
            {$set: {status, ...patch}},
            {new: true}
        ).populate(this._populateFields).lean() as ISessionEmail | null
    }

    async updateActivity(sessionId: string): Promise<ISessionEmail | null> {
        return await SessionEmailModel.findByIdAndUpdate(
            sessionId,
            {$set: {lastActivityAt: new Date()}},
            {new: true}
        ).populate(this._populateFields).lean() as ISessionEmail | null
    }

    async incrementAssignedCount(sessionId: string, count: number): Promise<ISessionEmail | null> {
        return await SessionEmailModel.findByIdAndUpdate(
            sessionId,
            {$inc: {assignedCount: count}, $set: {lastActivityAt: new Date()}},
            {new: true}
        ).populate(this._populateFields).lean() as ISessionEmail | null
    }

    async incrementClosedCount(sessionId: string): Promise<ISessionEmail | null> {
        return await SessionEmailModel.findByIdAndUpdate(
            sessionId,
            {$inc: {closedCount: 1}, $set: {lastActivityAt: new Date()}},
            {new: true}
        ).populate(this._populateFields).lean() as ISessionEmail | null
    }

    async incrementRepliedOnce(sessionId: string, inboundEmailId: string): Promise<ISessionEmail | null> {
        return await SessionEmailModel.findOneAndUpdate(
            {_id: sessionId, sessionRepliedInboundEmails: {$ne: inboundEmailId}},
            {
                $addToSet: {sessionRepliedInboundEmails: inboundEmailId},
                $inc: {repliedCount: 1},
                $set: {lastActivityAt: new Date()},
            },
            {new: true}
        ).populate(this._populateFields).lean() as ISessionEmail | null
    }

    async acquireCapacityFillLock(sessionId: string, lockUntil: Date): Promise<ISessionEmail | null> {
        const now = new Date()
        return await SessionEmailModel.findOneAndUpdate(
            {
                _id: sessionId,
                status: 'ACTIVE',
                $or: [
                    {capacityFillLockedUntil: {$exists: false}},
                    {capacityFillLockedUntil: null},
                    {capacityFillLockedUntil: {$lte: now}},
                ],
            },
            {$set: {capacityFillLockedUntil: lockUntil}},
            {new: true}
        ).populate(this._populateFields).lean() as ISessionEmail | null
    }

    async releaseCapacityFillLock(sessionId: string): Promise<void> {
        await SessionEmailModel.updateOne(
            {_id: sessionId},
            {$set: {capacityFillLockedUntil: null}}
        ).exec()
    }
}

export default SessionEmailMongoRepository
export {SessionEmailMongoRepository}
