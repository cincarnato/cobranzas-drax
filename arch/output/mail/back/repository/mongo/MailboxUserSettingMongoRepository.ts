
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

}

export default MailboxUserSettingMongoRepository
export {MailboxUserSettingMongoRepository}

