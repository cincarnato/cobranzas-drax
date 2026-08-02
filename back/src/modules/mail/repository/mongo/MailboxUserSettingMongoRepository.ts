
import {AbstractMongoRepository} from "@drax/crud-back";
import {MailboxUserSettingModel} from "../../models/MailboxUserSettingModel.js";
import type {IMailboxUserSettingRepository} from '../../interfaces/IMailboxUserSettingRepository'
import type {IMailboxUserSetting, IMailboxUserSettingBase} from "../../interfaces/IMailboxUserSetting";


class MailboxUserSettingMongoRepository extends AbstractMongoRepository<IMailboxUserSetting, IMailboxUserSettingBase, IMailboxUserSettingBase> implements IMailboxUserSettingRepository {

    constructor() {
        super();
        this._model = MailboxUserSettingModel;
        this._searchFields = [];
        this._populateFields = ['mailbox', 'user'];
        this._lean = true
    }

    async findByMailboxAndUser(mailboxId: string, userId: string): Promise<IMailboxUserSetting | null> {
        return await this._model.findOne({mailbox: mailboxId, user: userId}).populate(this._populateFields).lean(this._lean).exec() as IMailboxUserSetting | null;
    }

    async upsertForMailboxAndUser(mailboxId: string, userId: string, data: Partial<IMailboxUserSettingBase>): Promise<IMailboxUserSetting> {
        return await this._model.findOneAndUpdate(
            {mailbox: mailboxId, user: userId},
            {$set: data, $setOnInsert: {mailbox: mailboxId, user: userId}},
            {new: true, upsert: true}
        ).populate(this._populateFields).lean(this._lean).exec() as IMailboxUserSetting;
    }

}

export default MailboxUserSettingMongoRepository
export {MailboxUserSettingMongoRepository}
