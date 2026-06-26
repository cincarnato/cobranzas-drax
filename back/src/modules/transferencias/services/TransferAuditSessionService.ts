import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";
import type {ITransferAuditSessionRepository} from "../interfaces/ITransferAuditSessionRepository";
import type {ITransferAuditSession, ITransferAuditSessionBase} from "../interfaces/ITransferAuditSession";
import type {ITransferEmail} from "../interfaces/ITransferEmail";
import TransferEmailServiceFactory from "../factory/services/TransferEmailServiceFactory.js";

interface ITransferAuditSessionState {
    session: ITransferAuditSession | null
    items: ITransferEmail[]
    currentItemId: string | null
    stats: {
        assignedCount: number
        auditedCount: number
        pendingCount: number
        validatedCount: number
        correctedCount: number
        discardedCount: number
        referredCount: number
    }
}

class TransferAuditSessionService extends AbstractService<ITransferAuditSession, ITransferAuditSessionBase, ITransferAuditSessionBase> {
    private repository: ITransferAuditSessionRepository;
    private readonly leaseMs = 20 * 60 * 1000;

    constructor(repository: ITransferAuditSessionRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(repository, baseSchema, fullSchema);
        this.repository = repository;
        this._validateOutput = true
    }

    async getActive(operatorId: string): Promise<ITransferAuditSessionState> {
        const session = await this.repository.findOperatorOpenSession(operatorId)
        if (!session) return this.buildState(null, [])

        const activeSession = await this.expireIfNeeded(session, operatorId)
        if (!activeSession) return this.buildState(null, [])

        const items = await TransferEmailServiceFactory.instance.findAssignedToSession(activeSession._id)
        const refreshed = await this.refreshCounters(activeSession, items)
        return this.buildState(refreshed, items)
    }

    async start(operatorId: string, batchSize = 5): Promise<ITransferAuditSessionState> {
        const current = await this.repository.findOperatorOpenSession(operatorId)
        const activeCurrent = current ? await this.expireIfNeeded(current, operatorId) : null
        if (activeCurrent?.status === 'ACTIVE' || activeCurrent?.status === 'PAUSED') {
            throw new Error('TRANSFER_AUDIT_SESSION_ALREADY_ACTIVE')
        }

        const now = new Date()
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
        })

        const items = await TransferEmailServiceFactory.instance.assignAvailableToSession(operatorId, session._id, batchSize, this.leaseMs)
        const refreshed = await this.repository.incrementAssignedCount(session._id, items.length) || session
        return this.buildState(refreshed, items)
    }

    async assignMore(sessionId: string, operatorId: string, batchSize = 5): Promise<ITransferAuditSessionState> {
        const session = await this.assertActiveSession(sessionId, operatorId)
        const items = await TransferEmailServiceFactory.instance.assignAvailableToSession(operatorId, session._id, batchSize, this.leaseMs)
        await this.repository.incrementAssignedCount(session._id, items.length)
        return this.getActive(operatorId)
    }

    async heartbeat(sessionId: string, operatorId: string): Promise<ITransferAuditSessionState> {
        await this.assertActiveSession(sessionId, operatorId)
        await TransferEmailServiceFactory.instance.renewAssignments(sessionId, operatorId, this.leaseMs)
        await this.repository.updateActivity(sessionId, operatorId, new Date(Date.now() + this.leaseMs))
        return this.getActive(operatorId)
    }

    async pause(sessionId: string, operatorId: string): Promise<ITransferAuditSessionState> {
        await this.assertOwnedSession(sessionId, operatorId)
        await TransferEmailServiceFactory.instance.releasePendingAssignments(sessionId, operatorId)
        await this.repository.updateStatus(sessionId, operatorId, 'PAUSED', {pausedAt: new Date()})
        return this.getActive(operatorId)
    }

    async resume(sessionId: string, operatorId: string): Promise<ITransferAuditSessionState> {
        const session = await this.assertOwnedSession(sessionId, operatorId)
        if (session.status !== 'PAUSED') throw new Error('TRANSFER_AUDIT_SESSION_NOT_PAUSED')
        await this.repository.updateStatus(sessionId, operatorId, 'ACTIVE', {
            lastActivityAt: new Date(),
            expiresAt: new Date(Date.now() + this.leaseMs),
        })
        return this.assignMore(sessionId, operatorId, session.batchSize || 5)
    }

    async complete(sessionId: string, operatorId: string): Promise<ITransferAuditSessionState> {
        await this.assertOwnedSession(sessionId, operatorId)
        await TransferEmailServiceFactory.instance.releasePendingAssignments(sessionId, operatorId)
        await this.repository.updateStatus(sessionId, operatorId, 'COMPLETED', {completedAt: new Date()})
        return this.getSessionState(sessionId)
    }

    async getItems(sessionId: string, operatorId: string): Promise<ITransferEmail[]> {
        await this.assertOwnedSession(sessionId, operatorId)
        return TransferEmailServiceFactory.instance.findAssignedToSession(sessionId)
    }

    async getSessionState(sessionId: string): Promise<ITransferAuditSessionState> {
        const session = await this.findById(sessionId)
        const items = await TransferEmailServiceFactory.instance.findAssignedToSession(sessionId)
        const refreshed = await this.refreshCounters(session, items)
        return this.buildState(refreshed, items)
    }

    private async assertActiveSession(sessionId: string, operatorId: string) {
        const session = await this.assertOwnedSession(sessionId, operatorId)
        if (session.status !== 'ACTIVE') throw new Error('TRANSFER_AUDIT_SESSION_NOT_ACTIVE')
        return await this.expireIfNeeded(session, operatorId) || Promise.reject(new Error('TRANSFER_AUDIT_SESSION_EXPIRED'))
    }

    private async assertOwnedSession(sessionId: string, operatorId: string) {
        const session = await this.findById(sessionId)
        const sessionOperator = typeof session.operator === 'object' ? session.operator._id?.toString() : session.operator?.toString()
        if (sessionOperator !== operatorId) throw new Error('TRANSFER_AUDIT_SESSION_FORBIDDEN')
        return session
    }

    private async expireIfNeeded(session: ITransferAuditSession, operatorId: string): Promise<ITransferAuditSession | null> {
        if (session.status !== 'ACTIVE' || !session.expiresAt || new Date(session.expiresAt).getTime() > Date.now()) {
            return session
        }

        await TransferEmailServiceFactory.instance.releasePendingAssignments(session._id, operatorId)
        await this.repository.updateStatus(session._id, operatorId, 'EXPIRED')
        return null
    }

    private async refreshCounters(session: ITransferAuditSession, items: ITransferEmail[]) {
        const counters = {
            assignedCount: items.length,
            auditedCount: items.filter((item) => item.status === 'AUDITADO').length,
            validatedCount: items.filter((item) => item.humanStatus === 'VALIDADO').length,
            correctedCount: items.filter((item) => item.humanStatus === 'CORREGIDO').length,
            discardedCount: items.filter((item) => item.humanStatus === 'DESCARTADO').length,
            referredCount: 0,
        }

        return await this.repository.refreshCounters(session._id, counters) || {...session, ...counters}
    }

    private buildState(session: ITransferAuditSession | null, items: ITransferEmail[]): ITransferAuditSessionState {
        const pending = items.filter((item) => item.status !== 'AUDITADO')
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
        }
    }
}

export default TransferAuditSessionService
export {TransferAuditSessionService}
