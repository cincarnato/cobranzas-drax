
import {AbstractMongoRepository} from "@drax/crud-back";
import {OutboundEmailModel} from "../../models/OutboundEmailModel.js";
import type {IOutboundEmailRepository} from '../../interfaces/IOutboundEmailRepository'
import type {IOutboundEmail, IOutboundEmailBase} from "../../interfaces/IOutboundEmail";


class OutboundEmailMongoRepository extends AbstractMongoRepository<IOutboundEmail, IOutboundEmailBase, IOutboundEmailBase> implements IOutboundEmailRepository {

    constructor() {
        super();
        this._model = OutboundEmailModel;
        this._searchFields = ['fromEmail', 'subject', 'bodyText', 'messageId', 'inReplyTo'];
        this._populateFields = ['inboundEmail', 'mailbox', 'user'];
        this._lean = true
    }

}

export default OutboundEmailMongoRepository
export {OutboundEmailMongoRepository}

