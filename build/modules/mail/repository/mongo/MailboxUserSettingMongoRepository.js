import { AbstractMongoRepository } from "@drax/crud-back";
import { MailboxUserSettingModel } from "../../models/MailboxUserSettingModel.js";
class MailboxUserSettingMongoRepository extends AbstractMongoRepository {
    constructor() {
        super();
        this._model = MailboxUserSettingModel;
        this._searchFields = [];
        this._populateFields = ['mailbox', 'user'];
        this._lean = true;
    }
    async findByMailboxAndUser(mailboxId, userId) {
        return await this._model.findOne({ mailbox: mailboxId, user: userId }).populate(this._populateFields).lean(this._lean).exec();
    }
    async upsertForMailboxAndUser(mailboxId, userId, data) {
        return await this._model.findOneAndUpdate({ mailbox: mailboxId, user: userId }, { $set: data, $setOnInsert: { mailbox: mailboxId, user: userId } }, { new: true, upsert: true }).populate(this._populateFields).lean(this._lean).exec();
    }
}
export default MailboxUserSettingMongoRepository;
export { MailboxUserSettingMongoRepository };
