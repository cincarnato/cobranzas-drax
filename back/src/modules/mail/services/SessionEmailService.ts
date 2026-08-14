import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";
import {BadRequestError, ForbiddenError, mongoose, NotFoundError} from "@drax/common-back";
import type {ISessionEmailRepository} from "../interfaces/ISessionEmailRepository";
import type {ISessionEmail, ISessionEmailBase, SessionEmailDailyStats, SessionEmailState} from "../interfaces/ISessionEmail";
import type {IMailbox} from "../interfaces/IMailbox";
import MailboxServiceFactory from "../factory/services/MailboxServiceFactory.js";
import InboundEmailServiceFactory from "../factory/services/InboundEmailServiceFactory.js";

class SessionEmailService extends AbstractService<ISessionEmail, ISessionEmailBase, ISessionEmailBase> {
    private repository: ISessionEmailRepository;
    private readonly lockMs = 30 * 1000;

    constructor(repository: ISessionEmailRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(repository, baseSchema, fullSchema);
        this.repository = repository;
        this._validateOutput = true
    }

    async current(mailboxId: string, userId: string): Promise<SessionEmailState> {
        const mailbox = await this.assertMailboxOperator(mailboxId, userId)
        const session = await this.repository.findUserOpenSession(mailbox._id, userId)
        return await this.buildState(session, mailbox)
    }

    async start(mailboxId: string, userId: string): Promise<SessionEmailState> {
        const mailbox = await this.assertMailboxOperator(mailboxId, userId)
        const existing = await this.repository.findUserOpenSession(mailbox._id, userId)
        if (existing) throw new BadRequestError("El operador ya tiene una atención activa o pausada para este mailbox.")

        const now = new Date()
        let session: ISessionEmail
        try {
            session = await this.repository.createOpenSession({
                mailbox: mailbox._id,
                user: userId,
                status: 'ACTIVE',
                startedAt: now,
                lastActivityAt: now,
                maxAssignableEmails: Number(mailbox.maxAssignableEmailsPerUser || 0),
                assignedCount: 0,
                repliedCount: 0,
                closedCount: 0,
                sessionRepliedInboundEmails: [],
            })
        } catch (error: any) {
            if (error?.code === 11000 || error?.message?.includes('ALREADY_OPEN')) {
                throw new BadRequestError("El operador ya tiene una atención activa o pausada para este mailbox.")
            }
            throw error
        }

        const assignedEmails = await this.fillOperatorCapacity(session._id)
        return await this.buildState(await this.findById(session._id), mailbox, assignedEmails)
    }

    async findOpenByMailbox(mailboxId: string): Promise<ISessionEmail[]> {
        return await this.repository.findOpenByMailbox(mailboxId)
    }

    async dailyStatsByMailbox(mailboxId: string, from: Date, to: Date): Promise<SessionEmailDailyStats[]> {
        return await this.repository.dailyStatsByMailbox(mailboxId, from, to)
    }

    async pause(sessionId: string, userId: string): Promise<SessionEmailState> {
        const session = await this.assertOwnedSession(sessionId, userId)
        const mailbox = await this.resolveMailbox(session.mailbox)
        const now = new Date()
        const updated = await this.updateStatusWhenFillIsIdle(sessionId, userId, 'PAUSED', {
            pausedAt: now,
            lastActivityAt: now,
        })
        return await this.buildState(updated, mailbox)
    }

    async resume(sessionId: string, userId: string): Promise<SessionEmailState> {
        const session = await this.assertOwnedSession(sessionId, userId)
        if (session.status !== 'PAUSED') throw new BadRequestError("La atención no está pausada.")
        const mailbox = await this.resolveMailbox(session.mailbox)
        await this.repository.updateStatus(sessionId, userId, 'ACTIVE', {
            pausedAt: null,
            lastActivityAt: new Date(),
        })
        const assignedEmails = await this.fillOperatorCapacity(sessionId)
        return await this.buildState(await this.findById(sessionId), mailbox, assignedEmails)
    }

    async close(sessionId: string, userId: string): Promise<SessionEmailState> {
        const session = await this.assertOwnedSession(sessionId, userId)
        const mailbox = await this.resolveMailbox(session.mailbox)
        const now = new Date()
        const updated = await this.updateStatusWhenFillIsIdle(sessionId, userId, 'CLOSED', {
            endedAt: now,
            lastActivityAt: now,
        })
        await InboundEmailServiceFactory.instance.releaseAutoAssignedBySession(sessionId, userId)
        return await this.buildState(updated, mailbox)
    }

    async closeBySupervisor(sessionId: string): Promise<SessionEmailState> {
        const session = await this.findById(sessionId)
        if (!session) throw new NotFoundError()
        if (session.status === 'CLOSED') throw new BadRequestError("La sesión ya está finalizada.")
        const mailbox = await this.resolveMailbox(session.mailbox)
        const sessionUserId = this.resolveId(session.user)
        const now = new Date()
        const updated = await this.updateStatusWhenFillIsIdle(sessionId, sessionUserId, 'CLOSED', {
            endedAt: now,
            lastActivityAt: now,
        })
        await InboundEmailServiceFactory.instance.releaseAutoAssignedBySession(sessionId, sessionUserId)
        return await this.buildState(updated, mailbox)
    }

    async fillOperatorCapacity(sessionId: string): Promise<any[]> {
        const lockUntil = new Date(Date.now() + this.lockMs)
        const session = await this.repository.acquireCapacityFillLock(sessionId, lockUntil)
        if (!session) return []

        const assignedEmails: any[] = []
        try {
            const mailbox = await this.resolveMailbox(session.mailbox)
            const mailboxValues = this.getMailboxValues(mailbox)
            const maxAssignableEmails = Number(session.maxAssignableEmails || 0)
            if (maxAssignableEmails <= 0) return []

            const currentAssignedCount = await InboundEmailServiceFactory.instance.countAssignedToUser(mailboxValues, this.resolveId(session.user))
            let availableSlots = maxAssignableEmails - currentAssignedCount

            // The session-level lock serializes capacity fills for the same operator session.
            // Each email is then claimed with findOneAndUpdate, so other operators cannot claim the same pending email.
            while (availableSlots > 0) {
                const active = await this.repository.findUserActiveSession(mailbox._id, this.resolveId(session.user))
                if (!active || active._id.toString() !== sessionId.toString()) break
                const assigned = await InboundEmailServiceFactory.instance.assignNextPendingAuto(mailboxValues, this.resolveId(session.user), sessionId)
                if (!assigned) break
                assignedEmails.push(assigned)
                availableSlots -= 1
            }

            if (assignedEmails.length) {
                await this.repository.incrementAssignedCount(sessionId, assignedEmails.length)
            }
            return assignedEmails
        } finally {
            await this.repository.releaseCapacityFillLock(sessionId)
        }
    }

    async onInboundEmailClosed(inboundEmail: any, userId?: string): Promise<void> {
        const sessionId = this.resolveId(inboundEmail?.assignedSession)
        const assignedTo = this.resolveId(inboundEmail?.assignedTo)
        if (!sessionId || (userId && assignedTo !== userId)) return
        await this.repository.incrementClosedCount(sessionId)
        const session = await this.findById(sessionId)
        if (session?.status === 'ACTIVE') {
            await this.fillOperatorCapacity(sessionId)
        }
    }

    async onInboundEmailReplied(inboundEmail: any): Promise<void> {
        const sessionId = this.resolveId(inboundEmail?.assignedSession)
        if (!sessionId) return
        await this.repository.incrementRepliedOnce(sessionId, inboundEmail._id)
    }

    private async updateStatusWhenFillIsIdle(sessionId: string, userId: string, status: ISessionEmail["status"], patch: Partial<ISessionEmailBase>) {
        for (let attempt = 0; attempt < 20; attempt += 1) {
            const updated = await this.repository.updateStatus(sessionId, userId, status, patch)
            if (updated) return updated
            await this.sleep(50)
        }
        throw new BadRequestError("La sesión está procesando asignaciones. Intentá nuevamente.")
    }

    private async buildState(session: ISessionEmail | null, mailbox?: IMailbox, assignedEmails: any[] = []): Promise<SessionEmailState> {
        const resolvedMailbox = mailbox || (session ? await this.resolveMailbox(session.mailbox) : null)
        const currentAssignedCount = session && resolvedMailbox
            ? await InboundEmailServiceFactory.instance.countAssignedToUser(this.getMailboxValues(resolvedMailbox), this.resolveId(session.user))
            : 0
        return {
            session,
            maxAssignableEmails: Number(session?.maxAssignableEmails || resolvedMailbox?.maxAssignableEmailsPerUser || 0),
            currentAssignedCount,
            assignedEmails,
        }
    }

    private async assertOwnedSession(sessionId: string, userId: string): Promise<ISessionEmail> {
        const session = await this.findById(sessionId)
        if (!session) throw new NotFoundError()
        if (this.resolveId(session.user) !== userId) throw new ForbiddenError()
        return session
    }

    private async assertMailboxOperator(mailboxId: string, userId: string): Promise<IMailbox> {
        const mailbox = await this.resolveMailbox(mailboxId)
        const operatorIds = this.getMailboxOperatorIds(mailbox)
        if (!operatorIds.length || !userId || !operatorIds.includes(userId)) throw new ForbiddenError()
        return mailbox
    }

    private async resolveMailbox(mailboxValue: any): Promise<IMailbox> {
        const raw = this.resolveId(mailboxValue)
        if (!raw) throw new NotFoundError("mailbox not found")
        try {
            if (!mongoose.Types.ObjectId.isValid(raw)) throw new Error("mailbox is not an ObjectId")
            const byId = await MailboxServiceFactory.instance.findById(raw)
            if (byId) return byId
        } catch {
            // Inbound emails may still store mailbox as email; sessions always store ObjectId.
        }
        const byEmail = await MailboxServiceFactory.instance.findOneBy("email", raw)
        if (!byEmail) throw new NotFoundError("mailbox not found")
        return byEmail
    }

    private getMailboxValues(mailbox: IMailbox): string[] {
        return [mailbox._id?.toString(), mailbox.email].filter(Boolean) as string[]
    }

    private getMailboxOperatorIds(mailbox: IMailbox): string[] {
        return (mailbox.operators || [])
            .map((operator: any) => this.resolveId(operator))
            .filter(Boolean)
    }

    private resolveId(value: any): string {
        if (!value) return ""
        if (typeof value === "object") return value._id?.toString() || value.id?.toString() || value.toString()
        return value.toString()
    }

    private sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }
}

export default SessionEmailService
export {SessionEmailService}
