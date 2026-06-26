import { AbstractService } from "@drax/crud-back";
import TransferEmailServiceFactory from "../factory/services/TransferEmailServiceFactory.js";
class TransferAuditSessionService extends AbstractService {
    constructor(repository, baseSchema, fullSchema) {
        super(repository, baseSchema, fullSchema);
        this.leaseMs = 20 * 60 * 1000;
        this.repository = repository;
        this._validateOutput = true;
    }
    async getActive(operatorId) {
        const session = await this.repository.findOperatorOpenSession(operatorId);
        if (!session)
            return this.buildState(null, []);
        const activeSession = await this.expireIfNeeded(session, operatorId);
        if (!activeSession)
            return this.buildState(null, []);
        const items = await TransferEmailServiceFactory.instance.findAssignedToSession(activeSession._id);
        const refreshed = await this.refreshCounters(activeSession, items);
        return this.buildState(refreshed, items);
    }
    async start(operatorId, batchSize = 5) {
        const current = await this.repository.findOperatorOpenSession(operatorId);
        const activeCurrent = current ? await this.expireIfNeeded(current, operatorId) : null;
        if (activeCurrent?.status === 'ACTIVE' || activeCurrent?.status === 'PAUSED') {
            throw new Error('TRANSFER_AUDIT_SESSION_ALREADY_ACTIVE');
        }
        const now = new Date();
        const session = await this.create({
            operator: operatorId,
            status: 'ACTIVE',
            startedAt: now,
            lastActivityAt: now,
            expiresAt: new Date(now.getTime() + this.leaseMs),
            batchSize,
            assignedCount: 0,
            auditedCount: 0,
            validatedCount: 0,
            correctedCount: 0,
            discardedCount: 0,
            referredCount: 0,
        });
        const items = await TransferEmailServiceFactory.instance.assignAvailableToSession(operatorId, session._id, batchSize, this.leaseMs);
        const refreshed = await this.repository.incrementAssignedCount(session._id, items.length) || session;
        return this.buildState(refreshed, items);
    }
    async assignMore(sessionId, operatorId, batchSize = 5) {
        const session = await this.assertActiveSession(sessionId, operatorId);
        const items = await TransferEmailServiceFactory.instance.assignAvailableToSession(operatorId, session._id, batchSize, this.leaseMs);
        await this.repository.incrementAssignedCount(session._id, items.length);
        return this.getActive(operatorId);
    }
    async heartbeat(sessionId, operatorId) {
        await this.assertActiveSession(sessionId, operatorId);
        await TransferEmailServiceFactory.instance.renewAssignments(sessionId, operatorId, this.leaseMs);
        await this.repository.updateActivity(sessionId, operatorId, new Date(Date.now() + this.leaseMs));
        return this.getActive(operatorId);
    }
    async pause(sessionId, operatorId) {
        await this.assertOwnedSession(sessionId, operatorId);
        await TransferEmailServiceFactory.instance.releasePendingAssignments(sessionId, operatorId);
        await this.repository.updateStatus(sessionId, operatorId, 'PAUSED', { pausedAt: new Date() });
        return this.getActive(operatorId);
    }
    async resume(sessionId, operatorId) {
        const session = await this.assertOwnedSession(sessionId, operatorId);
        if (session.status !== 'PAUSED')
            throw new Error('TRANSFER_AUDIT_SESSION_NOT_PAUSED');
        await this.repository.updateStatus(sessionId, operatorId, 'ACTIVE', {
            lastActivityAt: new Date(),
            expiresAt: new Date(Date.now() + this.leaseMs),
        });
        return this.assignMore(sessionId, operatorId, session.batchSize || 5);
    }
    async complete(sessionId, operatorId) {
        await this.assertOwnedSession(sessionId, operatorId);
        await TransferEmailServiceFactory.instance.releasePendingAssignments(sessionId, operatorId);
        await this.repository.updateStatus(sessionId, operatorId, 'COMPLETED', { completedAt: new Date() });
        return this.getSessionState(sessionId);
    }
    async getItems(sessionId, operatorId) {
        await this.assertOwnedSession(sessionId, operatorId);
        return TransferEmailServiceFactory.instance.findAssignedToSession(sessionId);
    }
    async getSessionState(sessionId) {
        const session = await this.findById(sessionId);
        const items = await TransferEmailServiceFactory.instance.findAssignedToSession(sessionId);
        const refreshed = await this.refreshCounters(session, items);
        return this.buildState(refreshed, items);
    }
    async assertActiveSession(sessionId, operatorId) {
        const session = await this.assertOwnedSession(sessionId, operatorId);
        if (session.status !== 'ACTIVE')
            throw new Error('TRANSFER_AUDIT_SESSION_NOT_ACTIVE');
        return await this.expireIfNeeded(session, operatorId) || Promise.reject(new Error('TRANSFER_AUDIT_SESSION_EXPIRED'));
    }
    async assertOwnedSession(sessionId, operatorId) {
        const session = await this.findById(sessionId);
        const sessionOperator = typeof session.operator === 'object' ? session.operator._id?.toString() : session.operator?.toString();
        if (sessionOperator !== operatorId)
            throw new Error('TRANSFER_AUDIT_SESSION_FORBIDDEN');
        return session;
    }
    async expireIfNeeded(session, operatorId) {
        if (session.status !== 'ACTIVE' || !session.expiresAt || new Date(session.expiresAt).getTime() > Date.now()) {
            return session;
        }
        await TransferEmailServiceFactory.instance.releasePendingAssignments(session._id, operatorId);
        await this.repository.updateStatus(session._id, operatorId, 'EXPIRED');
        return null;
    }
    async refreshCounters(session, items) {
        const counters = {
            assignedCount: items.length,
            auditedCount: items.filter((item) => item.status === 'AUDITADO').length,
            validatedCount: items.filter((item) => item.humanStatus === 'VALIDADO').length,
            correctedCount: items.filter((item) => item.humanStatus === 'CORREGIDO').length,
            discardedCount: items.filter((item) => item.humanStatus === 'DESCARTADO').length,
            referredCount: 0,
        };
        return await this.repository.refreshCounters(session._id, counters) || { ...session, ...counters };
    }
    buildState(session, items) {
        const pending = items.filter((item) => item.status !== 'AUDITADO');
        return {
            session,
            items,
            currentItemId: pending[0]?._id || null,
            stats: {
                assignedCount: items.length,
                auditedCount: items.filter((item) => item.status === 'AUDITADO').length,
                pendingCount: pending.length,
                validatedCount: items.filter((item) => item.humanStatus === 'VALIDADO').length,
                correctedCount: items.filter((item) => item.humanStatus === 'CORREGIDO').length,
                discardedCount: items.filter((item) => item.humanStatus === 'DESCARTADO').length,
                referredCount: 0,
            },
        };
    }
}
export default TransferAuditSessionService;
export { TransferAuditSessionService };
