
import {AbstractMongoRepository} from "@drax/crud-back";
import {MailboxModel} from "../../models/MailboxModel.js";
import type {IMailboxRepository} from '../../interfaces/IMailboxRepository'
import type {IMailbox, IMailboxBase} from "../../interfaces/IMailbox";


class MailboxMongoRepository extends AbstractMongoRepository<IMailbox, IMailboxBase, IMailboxBase> implements IMailboxRepository {

    constructor() {
        super();
        this._model = MailboxModel;
        this._searchFields = ['name', 'email', 'username', 'imapHost', 'popHost', 'smtpHost'];
        this._populateFields = [];
        this._lean = true
    }

}

export default MailboxMongoRepository
export {MailboxMongoRepository}

