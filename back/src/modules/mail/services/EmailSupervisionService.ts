import {BadRequestError, mongoose, NotFoundError} from "@drax/common-back";
import MailboxServiceFactory from "../factory/services/MailboxServiceFactory.js";
import SessionEmailServiceFactory from "../factory/services/SessionEmailServiceFactory.js";
import InboundEmailServiceFactory from "../factory/services/InboundEmailServiceFactory.js";
import type {IMailbox} from "../interfaces/IMailbox";
import type {ISessionEmail} from "../interfaces/ISessionEmail";
import type {
    EmailSupervisionAssignedEmail,
    EmailSupervisionDaily,
    EmailSupervisionDailyOperator,
    EmailSupervisionDailySummary,
    EmailSupervisionLive,
    EmailSupervisionMonthly,
    EmailSupervisionOperator,
    EmailSupervisionUser,
} from "../interfaces/IEmailSupervision";

class EmailSupervisionService {
    async live(mailboxId: string, includeWithoutSession = false): Promise<EmailSupervisionLive> {
        const mailbox = await this.resolveMailbox(mailboxId);
        const mailboxValues = this.getMailboxValues(mailbox);
        const sessionEmails = await SessionEmailServiceFactory.instance.findOpenByMailbox(mailbox._id);
        const currentAssignedByUser = await InboundEmailServiceFactory.instance.countAssignedByUser(mailboxValues);
        const today = this.getTodayRange();
        const emailCounts = await InboundEmailServiceFactory.instance.supervisionCounts(mailboxValues, today.from, today.to);
        const activeOperators = sessionEmails.filter((sessionEmail) => sessionEmail.status === "ACTIVE").length;
        const pausedOperators = sessionEmails.filter((sessionEmail) => sessionEmail.status === "PAUSED").length;

        const operators = this.buildSessionRows(sessionEmails, currentAssignedByUser);
        if (includeWithoutSession) {
            operators.push(...this.buildOperatorsWithoutSession(mailbox, sessionEmails, currentAssignedByUser));
        }

        return {
            summary: {
                activeOperators,
                pausedOperators,
                pendingEmails: emailCounts.pendingEmails,
                assignedEmails: emailCounts.assignedEmails,
                closedToday: emailCounts.closedToday,
                oldestPendingReceivedAt: emailCounts.oldestPendingReceivedAt || null,
            },
            operators,
        };
    }

    async assignedEmails(mailboxId: string, userId: string): Promise<EmailSupervisionAssignedEmail[]> {
        const mailbox = await this.resolveMailbox(mailboxId);
        const operatorIds = this.getMailboxOperatorIds(mailbox);
        if (!operatorIds.includes(userId)) {
            throw new BadRequestError("El usuario no está habilitado para gestionar este mailbox.");
        }
        return await InboundEmailServiceFactory.instance.findAssignedLiteByUser(this.getMailboxValues(mailbox), userId);
    }

    async daily(mailboxId: string, date?: string): Promise<EmailSupervisionDaily> {
        const mailbox = await this.resolveMailbox(mailboxId);
        const day = this.getDateRange(date);
        const {summary, operators} = await this.period(mailbox, day.from, day.to);

        return {
            date: day.date,
            from: day.from,
            to: day.to,
            summary,
            operators,
        };
    }

    async monthly(mailboxId: string, month?: string): Promise<EmailSupervisionMonthly> {
        const mailbox = await this.resolveMailbox(mailboxId);
        const range = this.getMonthRange(month);
        const {summary, operators} = await this.period(mailbox, range.from, range.to);

        return {
            month: range.month,
            from: range.from,
            to: range.to,
            summary,
            operators,
        };
    }

    private async period(mailbox: IMailbox, from: Date, to: Date): Promise<{summary: EmailSupervisionDailySummary, operators: EmailSupervisionDailyOperator[]}> {
        const stats = await SessionEmailServiceFactory.instance.dailyStatsByMailbox(mailbox._id, from, to);
        const operatorsById = new Map((mailbox.operators || []).map((operator) => {
            const user = this.toUser(operator);
            return [user.id, user];
        }));
        const operators = stats
            .map((row) => ({
                user: operatorsById.get(row.userId) || {id: row.userId},
                sessionCount: row.sessionCount,
                assignedCount: row.assignedCount,
                repliedCount: row.repliedCount,
                closedCount: row.closedCount,
                durationMs: row.durationMs,
                firstStartedAt: row.firstStartedAt,
                lastEndedAt: row.lastEndedAt,
                lastActivityAt: row.lastActivityAt,
            }))
            .sort((a, b) => b.closedCount - a.closedCount || b.repliedCount - a.repliedCount || b.assignedCount - a.assignedCount);
        return {
            summary: {
                sessionCount: operators.reduce((total, operator) => total + operator.sessionCount, 0),
                operatorCount: operators.length,
                assignedCount: operators.reduce((total, operator) => total + operator.assignedCount, 0),
                repliedCount: operators.reduce((total, operator) => total + operator.repliedCount, 0),
                closedCount: operators.reduce((total, operator) => total + operator.closedCount, 0),
                durationMs: operators.reduce((total, operator) => total + operator.durationMs, 0),
            },
            operators,
        };
    }

    private buildSessionRows(sessionEmails: ISessionEmail[], currentAssignedByUser: Record<string, number>): EmailSupervisionOperator[] {
        return sessionEmails.map((sessionEmail) => {
            const user = this.toUser(sessionEmail.user);
            return {
                user,
                status: sessionEmail.status === "PAUSED" ? "PAUSED" : "ACTIVE",
                sessionEmail,
                currentAssignedCount: currentAssignedByUser[user.id] || 0,
            };
        });
    }

    private buildOperatorsWithoutSession(mailbox: IMailbox, sessionEmails: ISessionEmail[], currentAssignedByUser: Record<string, number>): EmailSupervisionOperator[] {
        const openUserIds = new Set(sessionEmails.map((sessionEmail) => this.resolveId(sessionEmail.user)).filter(Boolean));
        return (mailbox.operators || [])
            .map((operator) => this.toUser(operator))
            .filter((user) => user.id && !openUserIds.has(user.id))
            .map((user) => ({
                user,
                status: "OUT_OF_SESSION",
                sessionEmail: null,
                currentAssignedCount: currentAssignedByUser[user.id] || 0,
            }));
    }

    private async resolveMailbox(mailboxValue: any): Promise<IMailbox> {
        const raw = this.resolveId(mailboxValue);
        if (!raw) throw new NotFoundError("mailbox not found");
        try {
            if (!mongoose.Types.ObjectId.isValid(raw)) throw new Error("mailbox is not an ObjectId");
            const byId = await MailboxServiceFactory.instance.findById(raw);
            if (byId) return byId;
        } catch {
            // InboundEmail may still store mailbox as email; dashboard URLs use ObjectId.
        }
        const byEmail = await MailboxServiceFactory.instance.findOneBy("email", raw);
        if (!byEmail) throw new NotFoundError("mailbox not found");
        return byEmail;
    }

    private getMailboxValues(mailbox: IMailbox): string[] {
        return [mailbox._id?.toString(), mailbox.email].filter(Boolean) as string[];
    }

    private getMailboxOperatorIds(mailbox: IMailbox): string[] {
        return (mailbox.operators || [])
            .map((operator: any) => this.resolveId(operator))
            .filter(Boolean);
    }

    private toUser(value: any): EmailSupervisionUser {
        const id = this.resolveId(value);
        if (!value || typeof value !== "object") return {id};
        return {
            id,
            name: value.name,
            email: value.email,
        };
    }

    private resolveId(value: any): string {
        if (!value) return "";
        if (typeof value === "object") return value._id?.toString() || value.id?.toString() || value.toString();
        return value.toString();
    }

    private getTodayRange() {
        const from = new Date();
        from.setHours(0, 0, 0, 0);
        const to = new Date(from);
        to.setDate(to.getDate() + 1);
        return {from, to};
    }

    private getDateRange(value?: string) {
        const source = value || this.formatDate(new Date());
        if (!/^\d{4}-\d{2}-\d{2}$/.test(source)) throw new BadRequestError("Fecha inválida.");
        const from = new Date(`${source}T00:00:00`);
        if (Number.isNaN(from.getTime())) throw new BadRequestError("Fecha inválida.");
        const to = new Date(from);
        to.setDate(to.getDate() + 1);
        return {date: source, from, to};
    }

    private getMonthRange(value?: string) {
        const source = value || this.formatMonth(new Date());
        if (!/^\d{4}-\d{2}$/.test(source)) throw new BadRequestError("Mes inválido.");
        const from = new Date(`${source}-01T00:00:00`);
        if (Number.isNaN(from.getTime())) throw new BadRequestError("Mes inválido.");
        const to = new Date(from);
        to.setMonth(to.getMonth() + 1);
        return {month: source, from, to};
    }

    private formatDate(value: Date) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, "0");
        const day = String(value.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    private formatMonth(value: Date) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, "0");
        return `${year}-${month}`;
    }
}

export default EmailSupervisionService;
export {EmailSupervisionService};
