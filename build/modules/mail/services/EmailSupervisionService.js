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
}
export default EmailSupervisionService;
export { EmailSupervisionService };
