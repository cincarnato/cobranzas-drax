import { AbstractMongoRepository } from "@drax/crud-back";
import { OutboundEmailModel } from "../../models/OutboundEmailModel.js";
class OutboundEmailMongoRepository extends AbstractMongoRepository {
    constructor() {
        super();
        this._model = OutboundEmailModel;
        this._searchFields = ['fromEmail', 'subject', 'bodyText', 'messageId', 'inReplyTo'];
        this._populateFields = ['inboundEmail', 'mailbox', 'user'];
        this._lean = true;
    }
    async findByInboundEmailIds(inboundEmailIds) {
        return await this._model
            .find({ inboundEmail: { $in: inboundEmailIds } })
            .populate(this._populateFields)
            .sort({ createdAt: 1 })
            .lean(this._lean)
            .exec();
    }
    async findByMessageIds(messageIds) {
        if (!messageIds.length)
            return [];
        return await this._model
            .find({ messageId: { $in: messageIds } })
            .populate(this._populateFields)
            .sort({ createdAt: 1 })
            .lean(this._lean)
            .exec();
    }
    async standalonePaginate(options) {
        const page = Math.max(Number(options.page || 1), 1);
        const pageSize = Math.min(Math.max(Number(options.pageSize || 25), 1), 100);
        const query = {
            mailbox: options.mailboxId,
            $or: [
                { inboundEmail: { $exists: false } },
                { inboundEmail: null },
            ],
        };
        const [items, totalItems] = await Promise.all([
            this._model.find(query)
                .populate(this._populateFields)
                .sort({ sentAt: -1, createdAt: -1 })
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .lean(this._lean)
                .exec(),
            this._model.countDocuments(query),
        ]);
        return { items, totalItems };
    }
}
export default OutboundEmailMongoRepository;
export { OutboundEmailMongoRepository };
