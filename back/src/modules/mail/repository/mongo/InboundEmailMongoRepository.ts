
import {AbstractMongoRepository} from "@drax/crud-back";
import {InboundEmailModel} from "../../models/InboundEmailModel.js";
import type {
    FindInboundEmailsByProcessMarkOptions,
    IInboundEmailRepository
} from '../../interfaces/IInboundEmailRepository'
import type {IInboundEmail, IInboundEmailBase} from "../../interfaces/IInboundEmail";


class InboundEmailMongoRepository extends AbstractMongoRepository<IInboundEmail, IInboundEmailBase, IInboundEmailBase> implements IInboundEmailRepository {

    constructor() {
        super();
        this._model = InboundEmailModel;
        this._searchFields = ['messageId', 'threadId', 'mailbox', 'subject', 'fromName', 'fromEmail', 'replyToEmail', 'bodyText', 'normalizedText', 'category', 'duplicateOfMessageId'];
        this._populateFields = [];
        this._lean = true
    }

    async findByProcessMarkStatus({
                                      processMarkKey,
                                      processingStatus = "PROCESSED",
                                      category = null,
                                      retryStatus = "FAILED",
                                      maxAttempts = 2,
                                      since = null,
                                      limit = 10,
                                      orderBy = "receivedAt",
                                      order = "asc",
                                  }: FindInboundEmailsByProcessMarkOptions): Promise<IInboundEmail[]> {
        const query: Record<string, any> = {
            processingStatus,
            $or: [
                {processMarks: {$not: {$elemMatch: {key: processMarkKey}}}},
                {processMarks: {$elemMatch: {key: processMarkKey, status: retryStatus, attempts: {$lt: maxAttempts}}}},
                {processMarks: {$elemMatch: {key: processMarkKey, status: retryStatus, attempts: {$exists: false}}}},
            ],
        };

        if (since) {
            query.receivedAt = {$gte: since};
        }

        if (category) {
            query.category = category;
        }

        const sort: Record<string, 1 | -1> = {
            [orderBy]: order === "desc" ? -1 : 1,
        };

        return await this._model
            .find(query)
            .limit(limit)
            .sort(sort)
            .lean(this._lean)
            .exec() as IInboundEmail[];
    }

}

export default InboundEmailMongoRepository
export {InboundEmailMongoRepository}
