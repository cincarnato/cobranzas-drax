
import {AbstractMongoRepository} from "@drax/crud-back";
import {InboundEmailModel} from "../../models/InboundEmailModel.js";
import type {
    FindInboundEmailsByProcessMarkOptions,
    IInboundEmailRepository,
    InboundEmailClassificationUpdate,
    InboundEmailManagementListOptions,
    InboundEmailManagementListResult
} from '../../interfaces/IInboundEmailRepository'
import type {IInboundEmail, IInboundEmailBase} from "../../interfaces/IInboundEmail";
import {EmailUserStateModel} from "../../models/EmailUserStateModel.js";


class InboundEmailMongoRepository extends AbstractMongoRepository<IInboundEmail, IInboundEmailBase, IInboundEmailBase> implements IInboundEmailRepository {

    constructor() {
        super();
        this._model = InboundEmailModel;
        this._searchFields = ['messageId', 'threadId', 'mailbox', 'subject', 'fromName', 'fromEmail', 'replyToEmail', 'bodyText', 'normalizedText', 'category', 'attentionStatus', 'duplicateOfMessageId'];
        this._populateFields = ['assignedTo'];
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

    async managementPaginate(options: InboundEmailManagementListOptions): Promise<InboundEmailManagementListResult> {
        const page = Math.max(Number(options.page || 1), 1);
        const pageSize = Math.min(Math.max(Number(options.pageSize || 25), 1), 100);
        const query = await this.buildManagementQuery(options);
        const sortBy = this.safeSortBy(options.sortBy || "receivedAt");
        const sortDirection = options.sortDirection === "asc" ? 1 : -1;
        const totalItems = await this._model.countDocuments(query).exec();
        const items = await this._model.find(query)
            .populate(this._populateFields)
            .sort({[sortBy]: sortDirection})
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .lean(this._lean)
            .exec() as IInboundEmail[];

        return {
            items: await this.attachUserStates(items, options.currentUserId),
            page,
            pageSize,
            totalItems,
            totalPages: Math.max(Math.ceil(totalItems / pageSize), 1),
        };
    }

    async findThread(inboundEmail: IInboundEmail): Promise<IInboundEmail[]> {
        const query: Record<string, any> = inboundEmail.threadId
            ? {$or: [{_id: inboundEmail._id}, {threadId: inboundEmail.threadId, mailbox: inboundEmail.mailbox}]}
            : {_id: inboundEmail._id};

        return await this._model.find(query)
            .populate(this._populateFields)
            .sort({receivedAt: 1})
            .lean(this._lean)
            .exec() as IInboundEmail[];
    }

    async assignToMe(id: string, userId: string): Promise<IInboundEmail | null> {
        return await this._model.findOneAndUpdate(
            {_id: id, attentionStatus: "PENDING", $or: [{assignedTo: {$exists: false}}, {assignedTo: null}]},
            {$set: {attentionStatus: "ASSIGNED", assignedTo: userId, assignedAt: new Date()}},
            {new: true}
        ).populate(this._populateFields).lean(this._lean).exec() as IInboundEmail | null;
    }

    async reassign(id: string, userId: string | null): Promise<IInboundEmail | null> {
        return await this._model.findByIdAndUpdate(
            id,
            {$set: {attentionStatus: userId ? "ASSIGNED" : "PENDING", assignedTo: userId, assignedAt: userId ? new Date() : null}},
            {new: true}
        ).populate(this._populateFields).lean(this._lean).exec() as IInboundEmail | null;
    }

    async updateClassification(id: string, data: InboundEmailClassificationUpdate): Promise<IInboundEmail | null> {
        return await this._model.findByIdAndUpdate(id, {$set: data}, {new: true})
            .populate(this._populateFields)
            .lean(this._lean)
            .exec() as IInboundEmail | null;
    }

    async closeManagement(id: string): Promise<IInboundEmail | null> {
        return await this._model.findByIdAndUpdate(id, {$set: {attentionStatus: "CLOSED"}}, {new: true})
            .populate(this._populateFields)
            .lean(this._lean)
            .exec() as IInboundEmail | null;
    }

    private async buildManagementQuery(options: InboundEmailManagementListOptions) {
        const query: Record<string, any> = {};
        if (options.mailboxValues?.length) query.mailbox = {$in: options.mailboxValues};
        if (options.attentionStatus) query.attentionStatus = options.attentionStatus;
        if (options.assignedTo) query.assignedTo = options.assignedTo;
        if (options.category) query.category = options.category;
        if (options.priorities?.length) query.priority = {$in: options.priorities};
        if (options.tags?.length) query.tags = {$all: options.tags};
        if (typeof options.hasAttachments === "boolean") query.hasAttachments = options.hasAttachments;
        if (options.withoutReply) query.replyCount = {$in: [0, null]};
        if (options.dateFrom || options.dateTo) {
            query.receivedAt = {};
            if (options.dateFrom) query.receivedAt.$gte = options.dateFrom;
            if (options.dateTo) query.receivedAt.$lte = options.dateTo;
        }
        if (options.search?.trim()) {
            const regex = new RegExp(this.escapeRegExp(options.search.trim()), "i");
            query.$or = [
                {subject: regex},
                {fromName: regex},
                {fromEmail: regex},
                {normalizedText: regex},
                {bodyText: regex},
                {attachmentsOcrText: regex},
                {"customer.name": regex},
                {"customer.documentNumber": regex},
                {"customer.cuil": regex},
                {"extractedEntities.value": regex},
            ];
        }
        if (options.starredOnly && options.currentUserId) {
            const states = await EmailUserStateModel.find({user: options.currentUserId, isStarred: true}).select("inboundEmail").lean(this._lean).exec() as any[];
            query._id = {$in: states.map((state: any) => state.inboundEmail)};
        }
        return query;
    }

    private async attachUserStates(items: IInboundEmail[], userId?: string) {
        if (!userId || !items.length) return items;
        const states = await EmailUserStateModel.find({
            user: userId,
            inboundEmail: {$in: items.map((item) => item._id)}
        }).lean(this._lean).exec() as any[];
        const byEmail = new Map(states.map((state: any) => [state.inboundEmail?.toString(), state]));
        return items.map((item: any) => ({...item, userState: byEmail.get(item._id?.toString()) || null}));
    }

    private safeSortBy(sortBy: string) {
        return ["receivedAt", "subject", "fromName", "fromEmail", "attentionStatus", "priority", "category"].includes(sortBy) ? sortBy : "receivedAt";
    }

    private escapeRegExp(value: string) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

}

export default InboundEmailMongoRepository
export {InboundEmailMongoRepository}
