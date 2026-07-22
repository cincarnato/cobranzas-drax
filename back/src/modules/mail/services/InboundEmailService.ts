
import type{
    FindInboundEmailsByProcessMarkOptions,
    IInboundEmailRepository,
    InboundEmailClassificationUpdate,
    InboundEmailManagementDetail,
    InboundEmailManagementListOptions,
    InboundEmailManagementListResult
} from "../interfaces/IInboundEmailRepository";
import type {IInboundEmailBase, IInboundEmail} from "../interfaces/IInboundEmail";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";
import {BadRequestError, ForbiddenError, NotFoundError} from "@drax/common-back";
import MailboxServiceFactory from "../factory/services/MailboxServiceFactory.js";
import OutboundEmailServiceFactory from "../factory/services/OutboundEmailServiceFactory.js";
import EmailUserStateServiceFactory from "../factory/services/EmailUserStateServiceFactory.js";

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

    async managementPaginate(options: InboundEmailManagementListOptions): Promise<InboundEmailManagementListResult> {
        const mailbox = options.mailboxValues?.[0] ? await this.resolveMailbox(options.mailboxValues[0]) : null;
        return await this.repository.managementPaginate({
            ...options,
            mailboxValues: mailbox ? [mailbox._id?.toString(), mailbox.email].filter(Boolean) : options.mailboxValues,
        });
    }

    async managementDetail(id: string, currentUserId: string): Promise<InboundEmailManagementDetail> {
        const inboundEmail = await this.findById(id);
        if (!inboundEmail) throw new NotFoundError();
        const mailbox = await this.resolveMailbox(inboundEmail.mailbox);
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

    async assignToMe(id: string, userId: string): Promise<IInboundEmail> {
        const updated = await this.repository.assignToMe(id, userId);
        if (!updated) throw new Error("INBOUND_EMAIL_ASSIGNMENT_CONFLICT");
        return updated;
    }

    async reassign(id: string, userId: string | null): Promise<IInboundEmail> {
        const updated = await this.repository.reassign(id, userId);
        if (!updated) throw new NotFoundError();
        return updated;
    }

    async updateClassification(id: string, data: InboundEmailClassificationUpdate): Promise<IInboundEmail> {
        const updated = await this.repository.updateClassification(id, data);
        if (!updated) throw new NotFoundError();
        return updated;
    }

    async closeManagement(id: string): Promise<IInboundEmail> {
        const inboundEmail = await this.findById(id);
        if (!inboundEmail) throw new NotFoundError();
        const mailbox = await this.resolveMailbox(inboundEmail.mailbox);
        if (mailbox.replyRequiredToClose && !(inboundEmail.replyCount && inboundEmail.replyCount > 0)) {
            throw new BadRequestError("Este mailbox requiere una respuesta antes de cerrar la gestión.");
        }
        const updated = await this.repository.closeManagement(id);
        if (!updated) throw new NotFoundError();
        return updated;
    }

    assertCanOperate(inboundEmail: IInboundEmail, userId: string, isSupervisor: boolean) {
        if (isSupervisor) return;
        const assignedTo = typeof inboundEmail.assignedTo === "object" ? inboundEmail.assignedTo?._id?.toString() : inboundEmail.assignedTo?.toString();
        if (inboundEmail.attentionStatus === "CLOSED" || assignedTo !== userId) {
            throw new ForbiddenError();
        }
    }

    private async resolveMailbox(mailboxValue?: any) {
        if (!mailboxValue) throw new NotFoundError("mailbox not found");
        const raw = typeof mailboxValue === "object" ? mailboxValue._id?.toString() || mailboxValue.email : mailboxValue.toString();
        try {
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
