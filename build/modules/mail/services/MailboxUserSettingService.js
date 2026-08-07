import { AbstractService } from "@drax/crud-back";
import { ForbiddenError, mongoose, NotFoundError } from "@drax/common-back";
import MailboxServiceFactory from "../factory/services/MailboxServiceFactory.js";
class MailboxUserSettingService extends AbstractService {
    constructor(MailboxUserSettingRepository, baseSchema, fullSchema) {
        super(MailboxUserSettingRepository, baseSchema, fullSchema);
        this.repository = MailboxUserSettingRepository;
        this._validateOutput = true;
    }
    async current(mailboxId, userId) {
        const mailbox = await this.assertMailboxOperator(mailboxId, userId);
        return await this.repository.findByMailboxAndUser(mailbox._id, userId);
    }
    async saveCurrent(mailboxId, userId, data) {
        const mailbox = await this.assertMailboxOperator(mailboxId, userId);
        return await this.repository.upsertForMailboxAndUser(mailbox._id, userId, {
            signatureHtml: data.signatureHtml || "",
            signatureText: data.signatureText || "",
            autoAdvanceOnClose: Boolean(data.autoAdvanceOnClose),
        });
    }
    async assertMailboxOperator(mailboxId, userId) {
        const mailbox = await this.resolveMailbox(mailboxId);
        const operatorIds = this.getMailboxOperatorIds(mailbox);
        if (!operatorIds.length || !userId || !operatorIds.includes(userId))
            throw new ForbiddenError();
        return mailbox;
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
            // Some mail flows can identify mailboxes by email; settings store the ObjectId.
        }
        const byEmail = await MailboxServiceFactory.instance.findOneBy("email", raw);
        if (!byEmail)
            throw new NotFoundError("mailbox not found");
        return byEmail;
    }
    getMailboxOperatorIds(mailbox) {
        return (mailbox.operators || [])
            .map((operator) => this.resolveId(operator))
            .filter(Boolean);
    }
    resolveId(value) {
        if (!value)
            return "";
        if (typeof value === "object")
            return value._id?.toString() || value.id?.toString() || value.toString();
        return value.toString();
    }
}
export default MailboxUserSettingService;
export { MailboxUserSettingService };
