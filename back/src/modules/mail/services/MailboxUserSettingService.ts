
import type{IMailboxUserSettingRepository} from "../interfaces/IMailboxUserSettingRepository";
import type {IMailboxUserSettingBase, IMailboxUserSetting} from "../interfaces/IMailboxUserSetting";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";
import {ForbiddenError, mongoose, NotFoundError} from "@drax/common-back";
import type {IMailbox} from "../interfaces/IMailbox";
import MailboxServiceFactory from "../factory/services/MailboxServiceFactory.js";

class MailboxUserSettingService extends AbstractService<IMailboxUserSetting, IMailboxUserSettingBase, IMailboxUserSettingBase> {
    private repository: IMailboxUserSettingRepository;


    constructor(MailboxUserSettingRepository: IMailboxUserSettingRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(MailboxUserSettingRepository, baseSchema, fullSchema);
        this.repository = MailboxUserSettingRepository;
        
        this._validateOutput = true
        
    }

    async current(mailboxId: string, userId: string): Promise<IMailboxUserSetting | null> {
        const mailbox = await this.assertMailboxOperator(mailboxId, userId);
        return await this.repository.findByMailboxAndUser(mailbox._id, userId);
    }

    async saveCurrent(mailboxId: string, userId: string, data: Pick<IMailboxUserSettingBase, "signatureHtml" | "signatureText" | "autoAdvanceOnClose">): Promise<IMailboxUserSetting> {
        const mailbox = await this.assertMailboxOperator(mailboxId, userId);
        return await this.repository.upsertForMailboxAndUser(mailbox._id, userId, {
            signatureHtml: data.signatureHtml || "",
            signatureText: data.signatureText || "",
            autoAdvanceOnClose: Boolean(data.autoAdvanceOnClose),
        });
    }

    private async assertMailboxOperator(mailboxId: string, userId: string): Promise<IMailbox> {
        const mailbox = await this.resolveMailbox(mailboxId);
        const operatorIds = this.getMailboxOperatorIds(mailbox);
        if (!operatorIds.length || !userId || !operatorIds.includes(userId)) throw new ForbiddenError();
        return mailbox;
    }

    private async resolveMailbox(mailboxValue: any): Promise<IMailbox> {
        const raw = this.resolveId(mailboxValue);
        if (!raw) throw new NotFoundError("mailbox not found");
        try {
            if (!mongoose.Types.ObjectId.isValid(raw)) throw new Error("mailbox is not an ObjectId");
            const byId = await MailboxServiceFactory.instance.findById(raw);
            if (byId) return byId;
        } catch {
            // Some mail flows can identify mailboxes by email; settings store the ObjectId.
        }
        const byEmail = await MailboxServiceFactory.instance.findOneBy("email", raw);
        if (!byEmail) throw new NotFoundError("mailbox not found");
        return byEmail;
    }

    private getMailboxOperatorIds(mailbox: IMailbox): string[] {
        return (mailbox.operators || [])
            .map((operator: any) => this.resolveId(operator))
            .filter(Boolean);
    }

    private resolveId(value: any): string {
        if (!value) return "";
        if (typeof value === "object") return value._id?.toString() || value.id?.toString() || value.toString();
        return value.toString();
    }

}

export default MailboxUserSettingService
export {MailboxUserSettingService}
