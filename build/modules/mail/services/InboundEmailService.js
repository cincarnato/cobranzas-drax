import { AbstractService } from "@drax/crud-back";
import { BadRequestError, ForbiddenError, mongoose, NotFoundError } from "@drax/common-back";
import MailboxServiceFactory from "../factory/services/MailboxServiceFactory.js";
import OutboundEmailServiceFactory from "../factory/services/OutboundEmailServiceFactory.js";
import EmailUserStateServiceFactory from "../factory/services/EmailUserStateServiceFactory.js";
import SessionEmailServiceFactory from "../factory/services/SessionEmailServiceFactory.js";
class InboundEmailService extends AbstractService {
    constructor(InboundEmailRepository, baseSchema, fullSchema) {
        super(InboundEmailRepository, baseSchema, fullSchema);
        this.repository = InboundEmailRepository;
        this._validateOutput = true;
    }
    async findByProcessMarkStatus(options) {
        const items = await this._repository.findByProcessMarkStatus(options);
        const validatedItems = [];
        for (const item of items) {
            const transformedItem = this.transformRead ? await this.transformRead(item) : item;
            validatedItems.push(await this.validateOutput(transformedItem));
        }
        return validatedItems;
    }
    async findByMessageIds(messageIds, mailboxValues) {
        const items = await this.repository.findByMessageIds(messageIds, mailboxValues);
        const validatedItems = [];
        for (const item of items) {
            const transformedItem = this.transformRead ? await this.transformRead(item) : item;
            validatedItems.push(await this.validateOutput(transformedItem));
        }
        return validatedItems;
    }
    async findThread(inboundEmail) {
        const items = await this.repository.findThread(inboundEmail);
        const validatedItems = [];
        for (const item of items) {
            const transformedItem = this.transformRead ? await this.transformRead(item) : item;
            validatedItems.push(await this.validateOutput(transformedItem));
        }
        return validatedItems;
    }
    async managementPaginate(options) {
        const currentUserId = options.currentUserId || "";
        const mailboxValues = await this.resolveManagementMailboxValues(options.mailboxValues?.[0], currentUserId, options.assignedTo || null);
        if (!mailboxValues.length) {
            return {
                items: [],
                page: Math.max(Number(options.page || 1), 1),
                pageSize: Math.min(Math.max(Number(options.pageSize || 25), 1), 100),
                totalItems: 0,
                totalPages: 1,
            };
        }
        return await this.repository.managementPaginate({
            ...options,
            mailboxValues,
        });
    }
    async managementCounts(mailboxValue, currentUserId, isSupervisor) {
        const mailboxValues = await this.resolveManagementMailboxValues(mailboxValue, currentUserId, null);
        if (!mailboxValues.length) {
            return { PENDING: 0, ASSIGNED_TO_ME: 0, ASSIGNED_IN_ATTENTION: 0, ASSIGNED: 0 };
        }
        return await this.repository.managementCounts({
            mailboxValues,
            currentUserId,
            isSupervisor,
        });
    }
    async managementDetail(id, currentUserId) {
        const inboundEmail = await this.findById(id);
        if (!inboundEmail)
            throw new NotFoundError();
        const mailbox = await this.resolveMailbox(inboundEmail.mailbox);
        this.assertMailboxOperator(mailbox, currentUserId);
        const inboundThread = await this.repository.findThread(inboundEmail);
        const outboundThread = await OutboundEmailServiceFactory.instance.findByInboundEmailIds(inboundThread.map((item) => item._id));
        const userState = await EmailUserStateServiceFactory.instance.findByEmailAndUser(inboundEmail._id, currentUserId);
        return {
            inboundEmail,
            mailbox,
            assignedUser: inboundEmail.assignedTo && typeof inboundEmail.assignedTo === "object" ? inboundEmail.assignedTo : null,
            userState,
            inboundThread,
            outboundThread,
        };
    }
    async assignToMe(id, userId, force = false) {
        const inboundEmail = await this.findById(id);
        if (!inboundEmail)
            throw new NotFoundError();
        if (inboundEmail.attentionStatus === "CLOSED" || (!force && (inboundEmail.attentionStatus !== "PENDING" || inboundEmail.assignedTo))) {
            throw new Error("INBOUND_EMAIL_ASSIGNMENT_CONFLICT");
        }
        const mailbox = await this.resolveMailbox(inboundEmail.mailbox);
        this.assertMailboxOperator(mailbox, userId);
        const updated = await this.repository.assignToMe(id, userId, force);
        if (!updated)
            throw new Error("INBOUND_EMAIL_ASSIGNMENT_CONFLICT");
        return updated;
    }
    async assignNextPendingAuto(mailboxValues, userId, sessionId) {
        return await this.repository.assignNextPendingAuto(mailboxValues, userId, sessionId);
    }
    async countAssignedToUser(mailboxValues, userId) {
        return await this.repository.countAssignedToUser(mailboxValues, userId);
    }
    async countAssignedByUser(mailboxValues) {
        return await this.repository.countAssignedByUser(mailboxValues);
    }
    async supervisionCounts(mailboxValues, closedFrom, closedTo) {
        return await this.repository.supervisionCounts(mailboxValues, closedFrom, closedTo);
    }
    async findAssignedLiteByUser(mailboxValues, userId) {
        return await this.repository.findAssignedLiteByUser(mailboxValues, userId);
    }
    async releaseAutoAssignedBySession(sessionId, userId) {
        return await this.repository.releaseAutoAssignedBySession(sessionId, userId);
    }
    async reassign(id, userId, currentUserId) {
        const inboundEmail = await this.findById(id);
        if (!inboundEmail)
            throw new NotFoundError();
        const mailbox = await this.resolveMailbox(inboundEmail.mailbox);
        this.assertMailboxOperator(mailbox, currentUserId || "");
        this.assertAssignableOperator(mailbox, userId);
        const updated = await this.repository.reassign(id, userId);
        if (!updated)
            throw new NotFoundError();
        return updated;
    }
    async updateClassification(id, data, currentUserId) {
        if (currentUserId)
            await this.assertEmailMailboxOperator(id, currentUserId);
        const updated = await this.repository.updateClassification(id, data);
        if (!updated)
            throw new NotFoundError();
        return updated;
    }
    async closeManagement(id, currentUserId, closeReason) {
        const inboundEmail = await this.findById(id);
        if (!inboundEmail)
            throw new NotFoundError();
        const mailbox = await this.resolveMailbox(inboundEmail.mailbox);
        if (currentUserId)
            this.assertMailboxOperator(mailbox, currentUserId);
        const assignedTo = this.resolveAssignedToId(inboundEmail);
        if (!currentUserId || inboundEmail.attentionStatus !== "ASSIGNED" || assignedTo !== currentUserId) {
            throw new BadRequestError("Para cerrar la gestión primero tenés que tomar el correo.");
        }
        if (mailbox.replyRequiredToClose && !(inboundEmail.replyCount && inboundEmail.replyCount > 0)) {
            throw new BadRequestError("Este mailbox requiere una respuesta antes de cerrar la gestión.");
        }
        const resolvedCloseReason = closeReason || inboundEmail.closeReason || null;
        if (mailbox.closeReasonRequired && !resolvedCloseReason) {
            throw new BadRequestError("Este mailbox requiere un motivo de cierre antes de cerrar la gestión.");
        }
        const updated = await this.repository.closeManagement(id, resolvedCloseReason, currentUserId);
        if (!updated)
            throw new NotFoundError();
        await SessionEmailServiceFactory.instance.onInboundEmailClosed(inboundEmail, currentUserId);
        return updated;
    }
    async closeFromExternal(id, userId, closeReason) {
        const inboundEmail = await this.findById(id);
        if (!inboundEmail)
            throw new NotFoundError();
        const updated = await this.repository.closeManagement(id, closeReason || inboundEmail.closeReason || null, userId);
        if (!updated)
            throw new NotFoundError();
        await SessionEmailServiceFactory.instance.onInboundEmailClosed(inboundEmail, userId);
        return updated;
    }
    async reopenAndAssignToMe(id, userId) {
        const inboundEmail = await this.findById(id);
        if (!inboundEmail)
            throw new NotFoundError();
        if (inboundEmail.attentionStatus !== "CLOSED") {
            throw new BadRequestError("El correo no está cerrado.");
        }
        const mailbox = await this.resolveMailbox(inboundEmail.mailbox);
        this.assertMailboxOperator(mailbox, userId);
        const updated = await this.repository.reopenAndAssignToMe(id, userId);
        if (!updated)
            throw new NotFoundError();
        return updated;
    }
    assertCanOperate(inboundEmail, userId, isSupervisor) {
        if (isSupervisor)
            return;
        const assignedTo = this.resolveAssignedToId(inboundEmail);
        if (inboundEmail.attentionStatus === "CLOSED" || assignedTo !== userId) {
            throw new ForbiddenError();
        }
    }
    async assertEmailMailboxOperator(id, userId) {
        const inboundEmail = await this.findById(id);
        if (!inboundEmail)
            throw new NotFoundError();
        const mailbox = await this.resolveMailbox(inboundEmail.mailbox);
        this.assertMailboxOperator(mailbox, userId);
    }
    assertMailboxOperator(mailbox, userId) {
        const operatorIds = this.getMailboxOperatorIds(mailbox);
        if (!operatorIds.length || !userId || !operatorIds.includes(userId)) {
            throw new ForbiddenError();
        }
    }
    assertAssignableOperator(mailbox, userId) {
        if (!userId)
            return;
        const operatorIds = this.getMailboxOperatorIds(mailbox);
        if (!operatorIds.length || !operatorIds.includes(userId)) {
            throw new BadRequestError("El usuario no está habilitado para gestionar este mailbox.");
        }
    }
    getMailboxOperatorIds(mailbox) {
        return (mailbox.operators || [])
            .map((operator) => typeof operator === "object" ? operator?._id?.toString() || operator?.id?.toString() : operator?.toString())
            .filter(Boolean);
    }
    resolveAssignedToId(inboundEmail) {
        return typeof inboundEmail.assignedTo === "object"
            ? inboundEmail.assignedTo?._id?.toString() || inboundEmail.assignedTo?.id?.toString()
            : inboundEmail.assignedTo?.toString();
    }
    getMailboxValues(mailbox) {
        return [mailbox._id?.toString(), mailbox.email].filter(Boolean);
    }
    async resolveManagementMailboxValues(mailboxValue, currentUserId, assignedTo) {
        const mailbox = mailboxValue ? await this.resolveMailbox(mailboxValue) : null;
        if (mailbox) {
            this.assertMailboxOperator(mailbox, currentUserId);
            this.assertAssignableOperator(mailbox, assignedTo);
            return this.getMailboxValues(mailbox);
        }
        const mailboxes = await MailboxServiceFactory.instance.find({ limit: 1000 });
        const accessibleMailboxes = mailboxes.filter((item) => {
            try {
                this.assertMailboxOperator(item, currentUserId);
                this.assertAssignableOperator(item, assignedTo);
                return true;
            }
            catch {
                return false;
            }
        });
        return accessibleMailboxes.flatMap((item) => this.getMailboxValues(item));
    }
    async resolveMailbox(mailboxValue) {
        if (!mailboxValue)
            throw new NotFoundError("mailbox not found");
        const raw = typeof mailboxValue === "object" ? mailboxValue._id?.toString() || mailboxValue.email : mailboxValue.toString();
        try {
            if (!mongoose.Types.ObjectId.isValid(raw))
                throw new Error("mailbox is not an ObjectId");
            const byId = await MailboxServiceFactory.instance.findById(raw);
            if (byId)
                return byId;
        }
        catch {
            // Mailbox can be stored as email on inbound emails.
        }
        const byEmail = await MailboxServiceFactory.instance.findOneBy("email", raw);
        if (!byEmail)
            throw new NotFoundError("mailbox not found");
        return byEmail;
    }
}
export default InboundEmailService;
export { InboundEmailService };
