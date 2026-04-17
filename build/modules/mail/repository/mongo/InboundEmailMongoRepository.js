import { AbstractMongoRepository } from "@drax/crud-back";
import { InboundEmailModel } from "../../models/InboundEmailModel.js";
class InboundEmailMongoRepository extends AbstractMongoRepository {
    constructor() {
        super();
        this._model = InboundEmailModel;
        this._searchFields = ['messageId', 'threadId', 'mailbox', 'subject', 'fromName', 'fromEmail', 'replyToEmail', 'bodyText', 'normalizedText', 'category', 'duplicateOfMessageId'];
        this._populateFields = [];
        this._lean = true;
    }
}
export default InboundEmailMongoRepository;
export { InboundEmailMongoRepository };
