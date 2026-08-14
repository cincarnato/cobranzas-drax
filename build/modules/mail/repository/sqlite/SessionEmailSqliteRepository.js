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
    async dailyStatsByMailbox(mailboxId, from, to) {
        const rows = this.db.prepare(`
            SELECT
                user as userId,
                COUNT(*) as sessionCount,
                SUM(COALESCE(assignedCount, 0)) as assignedCount,
                SUM(COALESCE(repliedCount, 0)) as repliedCount,
                SUM(COALESCE(closedCount, 0)) as closedCount,
                MIN(startedAt) as firstStartedAt,
                MAX(endedAt) as lastEndedAt,
                MAX(lastActivityAt) as lastActivityAt,
                SUM(MAX((julianday(COALESCE(endedAt, datetime('now'))) - julianday(startedAt)) * 86400000, 0)) as durationMs
            FROM ${this.tableName}
            WHERE mailbox = @mailboxId AND startedAt >= @from AND startedAt < @to
            GROUP BY user
            ORDER BY closedCount DESC, repliedCount DESC, assignedCount DESC
        `).all({ mailboxId, from: from.toISOString(), to: to.toISOString() });
        return rows.map((row) => ({
            userId: String(row.userId || ""),
            sessionCount: Number(row.sessionCount || 0),
            assignedCount: Number(row.assignedCount || 0),
            repliedCount: Number(row.repliedCount || 0),
            closedCount: Number(row.closedCount || 0),
            durationMs: Number(row.durationMs || 0),
            firstStartedAt: row.firstStartedAt ? new Date(row.firstStartedAt) : null,
            lastEndedAt: row.lastEndedAt ? new Date(row.lastEndedAt) : null,
            lastActivityAt: row.lastActivityAt ? new Date(row.lastActivityAt) : null,
        }));
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
