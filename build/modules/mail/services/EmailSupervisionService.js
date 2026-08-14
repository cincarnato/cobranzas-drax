import { BadRequestError, mongoose, NotFoundError } from "@drax/common-back";
import MailboxServiceFactory from "../factory/services/MailboxServiceFactory.js";
import SessionEmailServiceFactory from "../factory/services/SessionEmailServiceFactory.js";
import InboundEmailServiceFactory from "../factory/services/InboundEmailServiceFactory.js";
class EmailSupervisionService {
    async live(mailboxId, includeWithoutSession = false) {
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
    async assignedEmails(mailboxId, userId) {
        const mailbox = await this.resolveMailbox(mailboxId);
        const operatorIds = this.getMailboxOperatorIds(mailbox);
        if (!operatorIds.includes(userId)) {
            throw new BadRequestError("El usuario no está habilitado para gestionar este mailbox.");
        }
        return await InboundEmailServiceFactory.instance.findAssignedLiteByUser(this.getMailboxValues(mailbox), userId);
    }
    async daily(mailboxId, date) {
        const mailbox = await this.resolveMailbox(mailboxId);
        const day = this.getDateRange(date);
        const { summary, operators } = await this.period(mailbox, day.from, day.to);
        return {
            date: day.date,
            from: day.from,
            to: day.to,
            summary,
            operators,
        };
    }
    async monthly(mailboxId, month) {
        const mailbox = await this.resolveMailbox(mailboxId);
        const range = this.getMonthRange(month);
        const { summary, operators } = await this.period(mailbox, range.from, range.to);
        return {
            month: range.month,
            from: range.from,
            to: range.to,
            summary,
            operators,
        };
    }
    async period(mailbox, from, to) {
        const stats = await SessionEmailServiceFactory.instance.dailyStatsByMailbox(mailbox._id, from, to);
        const operatorsById = new Map((mailbox.operators || []).map((operator) => {
            const user = this.toUser(operator);
            return [user.id, user];
        }));
        const operators = stats
            .map((row) => ({
            user: operatorsById.get(row.userId) || { id: row.userId },
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
    buildSessionRows(sessionEmails, currentAssignedByUser) {
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
    buildOperatorsWithoutSession(mailbox, sessionEmails, currentAssignedByUser) {
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
    async resolveMailbox(mailboxValue) {
        const raw = this.resolveId(mailboxValue);
        if (!raw)
            throw new NotFoundError("mailbox not found");
        try {
            if (!mongoose.Types.ObjectId.isValid(raw))
                throw new Error("mailbox is not an ObjectId");
            const byId = await MailboxServiceFactory.instance.findById(raw);
            if (byId)
                return byId;
        }
        catch {
            // InboundEmail may still store mailbox as email; dashboard URLs use ObjectId.
        }
        const byEmail = await MailboxServiceFactory.instance.findOneBy("email", raw);
        if (!byEmail)
            throw new NotFoundError("mailbox not found");
        return byEmail;
    }
    getMailboxValues(mailbox) {
        return [mailbox._id?.toString(), mailbox.email].filter(Boolean);
    }
    getMailboxOperatorIds(mailbox) {
        return (mailbox.operators || [])
            .map((operator) => this.resolveId(operator))
            .filter(Boolean);
    }
    toUser(value) {
        const id = this.resolveId(value);
        if (!value || typeof value !== "object")
            return { id };
        return {
            id,
            name: value.name,
            email: value.email,
        };
    }
    resolveId(value) {
        if (!value)
            return "";
        if (typeof value === "object")
            return value._id?.toString() || value.id?.toString() || value.toString();
        return value.toString();
    }
    getTodayRange() {
        const from = new Date();
        from.setHours(0, 0, 0, 0);
        const to = new Date(from);
        to.setDate(to.getDate() + 1);
        return { from, to };
    }
    getDateRange(value) {
        const source = value || this.formatDate(new Date());
        if (!/^\d{4}-\d{2}-\d{2}$/.test(source))
            throw new BadRequestError("Fecha inválida.");
        const from = new Date(`${source}T00:00:00`);
        if (Number.isNaN(from.getTime()))
            throw new BadRequestError("Fecha inválida.");
        const to = new Date(from);
        to.setDate(to.getDate() + 1);
        return { date: source, from, to };
    }
    getMonthRange(value) {
        const source = value || this.formatMonth(new Date());
        if (!/^\d{4}-\d{2}$/.test(source))
            throw new BadRequestError("Mes inválido.");
        const from = new Date(`${source}-01T00:00:00`);
        if (Number.isNaN(from.getTime()))
            throw new BadRequestError("Mes inválido.");
        const to = new Date(from);
        to.setMonth(to.getMonth() + 1);
        return { month: source, from, to };
    }
    formatDate(value) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, "0");
        const day = String(value.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
    formatMonth(value) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, "0");
        return `${year}-${month}`;
    }
}
export default EmailSupervisionService;
export { EmailSupervisionService };
