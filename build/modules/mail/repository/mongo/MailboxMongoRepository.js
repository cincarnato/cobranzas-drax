import { AbstractMongoRepository } from "@drax/crud-back";
import { MailboxModel } from "../../models/MailboxModel.js";
class MailboxMongoRepository extends AbstractMongoRepository {
    constructor() {
        super();
        this._model = MailboxModel;
        this._searchFields = ['name', 'email', 'username', 'imapHost', 'popHost', 'smtpHost'];
        this._populateFields = ['operators'];
        this._lean = true;
    }
}
export default MailboxMongoRepository;
export { MailboxMongoRepository };
