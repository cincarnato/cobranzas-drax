
import type{
    FindInboundEmailsByProcessMarkOptions,
    IInboundEmailRepository,
    InboundEmailClassificationUpdate,
    InboundEmailAssignedLite,
    InboundEmailManagementDetail,
    InboundEmailManagementCounts,
    InboundEmailManagementListOptions,
    InboundEmailManagementListResult,
    InboundEmailSupervisionCounts
} from "../interfaces/IInboundEmailRepository";
import type {IInboundEmailBase, IInboundEmail} from "../interfaces/IInboundEmail";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";
import {BadRequestError, ForbiddenError, mongoose, NotFoundError} from "@drax/common-back";
import MailboxServiceFactory from "../factory/services/MailboxServiceFactory.js";
import OutboundEmailServiceFactory from "../factory/services/OutboundEmailServiceFactory.js";
import EmailUserStateServiceFactory from "../factory/services/EmailUserStateServiceFactory.js";
import SessionEmailServiceFactory from "../factory/services/SessionEmailServiceFactory.js";
import type {IMailbox} from "../interfaces/IMailbox";

class InboundEmailService extends AbstractService<IInboundEmail, IInboundEmailBase, IInboundEmailBase> {
    private repository: IInboundEmailRepository;


    constructor(InboundEmailRepository: IInboundEmailRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(InboundEmailRepository, baseSchema, fullSchema);
        this.repository = InboundEmailRepository;
        
        this._validateOutput = true
        
    }

    async findByProcessMarkStatus(options: FindInboundEmailsByProcessMarkOptions): Promise<IInboundEmail[]> {
        const items = await (this._repository as IInboundEmailRepository).findByProcessMarkStatus(options);
        const validatedItems: IInboundEmail[] = [];

        for (const item of items) {
            const transformedItem = this.transformRead ? await this.transformRead(item) : item;
            validatedItems.push(await this.validateOutput(transformedItem));
        }

        return validatedItems;
    }

    async findByMessageIds(messageIds: string[], mailboxValues?: string[]): Promise<IInboundEmail[]> {
        const items = await this.repository.findByMessageIds(messageIds, mailboxValues);
        const validatedItems: IInboundEmail[] = [];

        for (const item of items) {
            const transformedItem = this.transformRead ? await this.transformRead(item) : item;
            validatedItems.push(await this.validateOutput(transformedItem));
        }

        return validatedItems;
    }

    async findThread(inboundEmail: IInboundEmail): Promise<IInboundEmail[]> {
        const items = await this.repository.findThread(inboundEmail);
        const validatedItems: IInboundEmail[] = [];

        for (const item of items) {
            const transformedItem = this.transformRead ? await this.transformRead(item) : item;
            validatedItems.push(await this.validateOutput(transformedItem));
        }

        return validatedItems;
    }

    async managementPaginate(options: InboundEmailManagementListOptions): Promise<InboundEmailManagementListResult> {
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

    async managementCounts(mailboxValue: string | undefined, currentUserId: string, isSupervisor: boolean): Promise<InboundEmailManagementCounts> {
        const mailboxValues = await this.resolveManagementMailboxValues(mailboxValue, currentUserId, null);
        if (!mailboxValues.length) {
            return {PENDING: 0, ASSIGNED_TO_ME: 0, ASSIGNED_IN_ATTENTION: 0, ASSIGNED: 0};
        }
        return await this.repository.managementCounts({
            mailboxValues,
            currentUserId,
            isSupervisor,
        });
    }

    async managementDetail(id: string, currentUserId: string): Promise<InboundEmailManagementDetail> {
        const inboundEmail = await this.findById(id);
        if (!inboundEmail) throw new NotFoundError();
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

    async assignToMe(id: string, userId: string, force = false): Promise<IInboundEmail> {
        const inboundEmail = await this.findById(id);
        if (!inboundEmail) throw new NotFoundError();
        if (inboundEmail.attentionStatus === "CLOSED" || (!force && (inboundEmail.attentionStatus !== "PENDING" || inboundEmail.assignedTo))) {
            throw new Error("INBOUND_EMAIL_ASSIGNMENT_CONFLICT");
        }
        const mailbox = await this.resolveMailbox(inboundEmail.mailbox);
        this.assertMailboxOperator(mailbox, userId);
        await this.assertAssignmentLimit(mailbox, userId, inboundEmail);
        const updated = await this.repository.assignToMe(id, userId, force);
        if (!updated) throw new Error("INBOUND_EMAIL_ASSIGNMENT_CONFLICT");
        return updated;
    }

    async assignNextPendingAuto(mailboxValues: string[], userId: string, sessionId: string): Promise<IInboundEmail | null> {
        return await this.repository.assignNextPendingAuto(mailboxValues, userId, sessionId);
    }

    async countAssignedToUser(mailboxValues: string[], userId: string): Promise<number> {
        return await this.repository.countAssignedToUser(mailboxValues, userId);
    }

    async countAssignedByUser(mailboxValues: string[]): Promise<Record<string, number>> {
        return await this.repository.countAssignedByUser(mailboxValues);
    }

    async supervisionCounts(mailboxValues: string[], closedFrom: Date, closedTo: Date): Promise<InboundEmailSupervisionCounts> {
        return await this.repository.supervisionCounts(mailboxValues, closedFrom, closedTo);
    }

    async findAssignedLiteByUser(mailboxValues: string[], userId: string): Promise<InboundEmailAssignedLite[]> {
        return await this.repository.findAssignedLiteByUser(mailboxValues, userId);
    }

    async releaseAutoAssignedBySession(sessionId: string, userId: string): Promise<number> {
        return await this.repository.releaseAutoAssignedBySession(sessionId, userId);
    }

    async reassign(id: string, userId: string | null, currentUserId?: string): Promise<IInboundEmail> {
        const inboundEmail = await this.findById(id);
        if (!inboundEmail) throw new NotFoundError();
        const mailbox = await this.resolveMailbox(inboundEmail.mailbox);
        this.assertMailboxOperator(mailbox, currentUserId || "");
        this.assertAssignableOperator(mailbox, userId);
        if (userId) await this.assertAssignmentLimit(mailbox, userId, inboundEmail);
        const updated = await this.repository.reassign(id, userId);
        if (!updated) throw new NotFoundError();
        return updated;
    }

    async updateClassification(id: string, data: InboundEmailClassificationUpdate, currentUserId?: string): Promise<IInboundEmail> {
        if (currentUserId) await this.assertEmailMailboxOperator(id, currentUserId);
        const updated = await this.repository.updateClassification(id, data);
        if (!updated) throw new NotFoundError();
        return updated;
    }

    async closeManagement(id: string, currentUserId?: string, closeReason?: string | null): Promise<IInboundEmail> {
        const inboundEmail = await this.findById(id);
        if (!inboundEmail) throw new NotFoundError();
        const mailbox = await this.resolveMailbox(inboundEmail.mailbox);
        if (currentUserId) this.assertMailboxOperator(mailbox, currentUserId);
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
        if (!updated) throw new NotFoundError();
        await SessionEmailServiceFactory.instance.onInboundEmailClosed(inboundEmail, currentUserId);
        return updated;
    }

    async closeFromExternal(id: string, userId: string, closeReason?: string | null): Promise<IInboundEmail> {
        const inboundEmail = await this.findById(id);
        if (!inboundEmail) throw new NotFoundError();
        const updated = await this.repository.closeManagement(id, closeReason || inboundEmail.closeReason || null, userId);
        if (!updated) throw new NotFoundError();
        await SessionEmailServiceFactory.instance.onInboundEmailClosed(inboundEmail, userId);
        return updated;
    }

    async reopenAndAssignToMe(id: string, userId: string): Promise<IInboundEmail> {
        const inboundEmail = await this.findById(id);
        if (!inboundEmail) throw new NotFoundError();
        if (inboundEmail.attentionStatus !== "CLOSED") {
            throw new BadRequestError("El correo no está cerrado.");
        }
        const mailbox = await this.resolveMailbox(inboundEmail.mailbox);
        this.assertMailboxOperator(mailbox, userId);
        await this.assertAssignmentLimit(mailbox, userId, inboundEmail);
        const updated = await this.repository.reopenAndAssignToMe(id, userId);
        if (!updated) throw new NotFoundError();
        return updated;
    }

    assertCanOperate(inboundEmail: IInboundEmail, userId: string, isSupervisor: boolean) {
        if (isSupervisor) return;
        const assignedTo = this.resolveAssignedToId(inboundEmail);
        if (inboundEmail.attentionStatus === "CLOSED" || assignedTo !== userId) {
            throw new ForbiddenError();
        }
    }

    async assertEmailMailboxOperator(id: string, userId: string): Promise<void> {
        const inboundEmail = await this.findById(id);
        if (!inboundEmail) throw new NotFoundError();
        const mailbox = await this.resolveMailbox(inboundEmail.mailbox);
        this.assertMailboxOperator(mailbox, userId);
    }

    private assertMailboxOperator(mailbox: IMailbox, userId: string): void {
        const operatorIds = this.getMailboxOperatorIds(mailbox);
        if (!operatorIds.length || !userId || !operatorIds.includes(userId)) {
            throw new ForbiddenError();
        }
    }

    private assertAssignableOperator(mailbox: IMailbox, userId: string | null): void {
        if (!userId) return;
        const operatorIds = this.getMailboxOperatorIds(mailbox);
        if (!operatorIds.length || !operatorIds.includes(userId)) {
            throw new BadRequestError("El usuario no está habilitado para gestionar este mailbox.");
        }
    }

    private async assertAssignmentLimit(mailbox: IMailbox, userId: string, inboundEmail: IInboundEmail): Promise<void> {
        const maxAssigned = Number(mailbox.maxAssignableEmailsPerUser || 0);
        if (!maxAssigned || maxAssigned <= 0) return;
        const assignedTo = this.resolveAssignedToId(inboundEmail);
        if (inboundEmail.attentionStatus === "ASSIGNED" && assignedTo === userId) return;
        const mailboxValues = this.getMailboxValues(mailbox);
        const assignedCount = await this.repository.countAssignedToUser(mailboxValues, userId);
        if (assignedCount >= maxAssigned) {
            throw new BadRequestError("El operador alcanzó el máximo de correos asignables para este mailbox.");
        }
    }

    private getMailboxOperatorIds(mailbox: IMailbox): string[] {
        return (mailbox.operators || [])
            .map((operator: any) => typeof operator === "object" ? operator?._id?.toString() || operator?.id?.toString() : operator?.toString())
            .filter(Boolean);
    }

    private resolveAssignedToId(inboundEmail: IInboundEmail): string | undefined {
        return typeof inboundEmail.assignedTo === "object"
            ? inboundEmail.assignedTo?._id?.toString() || inboundEmail.assignedTo?.id?.toString()
            : inboundEmail.assignedTo?.toString();
    }

    private getMailboxValues(mailbox: IMailbox): string[] {
        return [mailbox._id?.toString(), mailbox.email].filter(Boolean) as string[];
    }

    private async resolveManagementMailboxValues(mailboxValue: string | undefined, currentUserId: string, assignedTo: string | null): Promise<string[]> {
        const mailbox = mailboxValue ? await this.resolveMailbox(mailboxValue) : null;
        if (mailbox) {
            this.assertMailboxOperator(mailbox, currentUserId);
            this.assertAssignableOperator(mailbox, assignedTo);
            return this.getMailboxValues(mailbox);
        }

        const mailboxes = await MailboxServiceFactory.instance.find({limit: 1000});
        const accessibleMailboxes = mailboxes.filter((item) => {
            try {
                this.assertMailboxOperator(item, currentUserId);
                this.assertAssignableOperator(item, assignedTo);
                return true;
            } catch {
                return false;
            }
        });
        return accessibleMailboxes.flatMap((item) => this.getMailboxValues(item));
    }

    private async resolveMailbox(mailboxValue?: any) {
        if (!mailboxValue) throw new NotFoundError("mailbox not found");
        const raw = typeof mailboxValue === "object" ? mailboxValue._id?.toString() || mailboxValue.email : mailboxValue.toString();
        try {
            if (!mongoose.Types.ObjectId.isValid(raw)) throw new Error("mailbox is not an ObjectId");
            const byId = await MailboxServiceFactory.instance.findById(raw);
            if (byId) return byId;
        } catch {
            // Mailbox can be stored as email on inbound emails.
        }
        const byEmail = await MailboxServiceFactory.instance.findOneBy("email", raw);
        if (!byEmail) throw new NotFoundError("mailbox not found");
        return byEmail;
    }

}

export default InboundEmailService
export {InboundEmailService}
