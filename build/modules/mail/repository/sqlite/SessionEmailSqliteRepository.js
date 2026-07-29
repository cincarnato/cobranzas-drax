import { AbstractSqliteRepository } from "@drax/crud-back";
class SessionEmailSqliteRepository extends AbstractSqliteRepository {
    constructor() {
        super(...arguments);
        this.tableName = 'SessionEmail';
        this.searchFields = [];
        this.booleanFields = [];
        this.jsonFields = ['sessionRepliedInboundEmails'];
        this.identifier = '_id';
        this.populateFields = [];
        this.verbose = false;
        this.tableFields = [
            { name: "mailbox", type: "TEXT", unique: undefined, primary: false },
            { name: "user", type: "TEXT", unique: undefined, primary: false },
            { name: "status", type: "TEXT", unique: undefined, primary: false },
            { name: "startedAt", type: "TEXT", unique: undefined, primary: false },
            { name: "pausedAt", type: "TEXT", unique: undefined, primary: false },
            { name: "endedAt", type: "TEXT", unique: undefined, primary: false },
            { name: "lastActivityAt", type: "TEXT", unique: undefined, primary: false },
            { name: "maxAssignableEmails", type: "REAL", unique: undefined, primary: false },
            { name: "assignedCount", type: "REAL", unique: undefined, primary: false },
            { name: "repliedCount", type: "REAL", unique: undefined, primary: false },
            { name: "closedCount", type: "REAL", unique: undefined, primary: false },
            { name: "sessionRepliedInboundEmails", type: "TEXT", unique: undefined, primary: false },
            { name: "capacityFillLockedUntil", type: "TEXT", unique: undefined, primary: false },
        ];
    }
    async findUserOpenSession(mailboxId, userId) {
        const item = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE mailbox = @mailboxId AND user = @userId AND status IN ('ACTIVE', 'PAUSED') LIMIT 1`).get({ mailboxId, userId });
        if (item)
            await this.decorate(item);
        return item || null;
    }
    async findUserActiveSession(mailboxId, userId) {
        const item = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE mailbox = @mailboxId AND user = @userId AND status = 'ACTIVE' LIMIT 1`).get({ mailboxId, userId });
        if (item)
            await this.decorate(item);
        return item || null;
    }
    async findOpenByMailbox(mailboxId) {
        const items = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE mailbox = @mailboxId AND status IN ('ACTIVE', 'PAUSED')`).all({ mailboxId });
        for (const item of items) {
            await this.decorate(item);
        }
        return items;
    }
    async createOpenSession(data) {
        if (await this.findUserOpenSession(String(data.mailbox), String(data.user)))
            throw new Error('SESSION_EMAIL_ALREADY_OPEN');
        return await this.create(data);
    }
    async updateStatus(sessionId, userId, status, patch = {}) {
        const item = await this.findById(sessionId);
        if (!item || String(item.user) !== String(userId))
            return null;
        return await this.update(sessionId, { ...item, ...patch, status });
    }
    async updateActivity(sessionId) {
        const item = await this.findById(sessionId);
        if (!item)
            return null;
        return await this.update(sessionId, { ...item, lastActivityAt: new Date() });
    }
    async incrementAssignedCount(sessionId, count) {
        const item = await this.findById(sessionId);
        if (!item)
            return null;
        return await this.update(sessionId, { ...item, assignedCount: Number(item.assignedCount || 0) + count, lastActivityAt: new Date() });
    }
    async incrementClosedCount(sessionId) {
        const item = await this.findById(sessionId);
        if (!item)
            return null;
        return await this.update(sessionId, { ...item, closedCount: Number(item.closedCount || 0) + 1, lastActivityAt: new Date() });
    }
    async incrementRepliedOnce(sessionId, inboundEmailId) {
        const item = await this.findById(sessionId);
        if (!item)
            return null;
        const replied = (item.sessionRepliedInboundEmails || []).map(String);
        if (replied.includes(inboundEmailId))
            return item;
        return await this.update(sessionId, {
            ...item,
            sessionRepliedInboundEmails: [...replied, inboundEmailId],
            repliedCount: Number(item.repliedCount || 0) + 1,
            lastActivityAt: new Date(),
        });
    }
    async acquireCapacityFillLock(sessionId, lockUntil) {
        const item = await this.findById(sessionId);
        if (!item || item.status !== 'ACTIVE')
            return null;
        const lockedUntil = item.capacityFillLockedUntil ? new Date(item.capacityFillLockedUntil).getTime() : 0;
        if (lockedUntil > Date.now())
            return null;
        return await this.update(sessionId, { ...item, capacityFillLockedUntil: lockUntil });
    }
    async releaseCapacityFillLock(sessionId) {
        const item = await this.findById(sessionId);
        if (item)
            await this.update(sessionId, { ...item, capacityFillLockedUntil: null });
    }
}
export default SessionEmailSqliteRepository;
export { SessionEmailSqliteRepository };
