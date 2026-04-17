
import {AbstractMongoRepository} from "@drax/crud-back";
import {InboundEmailModel} from "../../models/InboundEmailModel.js";
import type {IInboundEmailRepository} from '../../interfaces/IInboundEmailRepository'
import type {IInboundEmail, IInboundEmailBase} from "../../interfaces/IInboundEmail";


class InboundEmailMongoRepository extends AbstractMongoRepository<IInboundEmail, IInboundEmailBase, IInboundEmailBase> implements IInboundEmailRepository {

    constructor() {
        super();
        this._model = InboundEmailModel;
        this._searchFields = ['messageId', 'threadId', 'mailbox', 'subject', 'fromName', 'fromEmail', 'replyToEmail', 'bodyText', 'normalizedText', 'category', 'duplicateOfMessageId'];
        this._populateFields = [];
        this._lean = true
    }

}

export default InboundEmailMongoRepository
export {InboundEmailMongoRepository}

