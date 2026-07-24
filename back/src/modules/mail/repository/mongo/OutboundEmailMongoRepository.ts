
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

    async findByInboundEmailIds(inboundEmailIds: string[]): Promise<IOutboundEmail[]> {
        return await this._model
            .find({inboundEmail: {$in: inboundEmailIds}})
            .populate(this._populateFields)
            .sort({createdAt: 1})
            .lean(this._lean)
            .exec() as IOutboundEmail[];
    }

    async findByMessageIds(messageIds: string[]): Promise<IOutboundEmail[]> {
        if (!messageIds.length) return [];
        return await this._model
            .find({messageId: {$in: messageIds}})
            .populate(this._populateFields)
            .sort({createdAt: 1})
            .lean(this._lean)
            .exec() as IOutboundEmail[];
    }

}

export default OutboundEmailMongoRepository
export {OutboundEmailMongoRepository}
