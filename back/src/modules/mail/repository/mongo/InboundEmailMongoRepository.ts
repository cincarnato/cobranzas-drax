
import {AbstractMongoRepository} from "@drax/crud-back";
import {InboundEmailModel} from "../../models/InboundEmailModel.js";
import type {
    FindInboundEmailsByProcessMarkOptions,
    IInboundEmailRepository,
    InboundEmailClassificationUpdate,
    InboundEmailManagementCounts,
    InboundEmailManagementCountsOptions,
    InboundEmailManagementListOptions,
    InboundEmailManagementListResult
} from '../../interfaces/IInboundEmailRepository'
import type {IInboundEmail, IInboundEmailBase} from "../../interfaces/IInboundEmail";
import {EmailUserStateModel} from "../../models/EmailUserStateModel.js";
import {mongoose} from "@drax/common-back";

function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}


class InboundEmailMongoRepository extends AbstractMongoRepository<IInboundEmail, IInboundEmailBase, IInboundEmailBase> implements IInboundEmailRepository {
    private readonly managementListSelect = [
        "_id",
        "receivedAt",
        "subject",
        "fromName",
        "fromEmail",
        "assignedTo",
        "assignedAt",
        "assignmentMode",
        "attentionStatus",
        "replyCount",
        "hasAttachments",
        "attachmentCount",
        "attachmentsOcrError",
        "category",
        "sentiment",
        "priority",
        "summary",
        "tags",
        "processingStatus",
        "isDuplicate",
        "createdAt",
        "updatedAt",
    ].join(" ");

    constructor() {
        super();
        this._model = InboundEmailModel;
        this._searchFields = ['messageId', 'threadId', 'mailbox', 'subject', 'fromName', 'fromEmail', 'replyToEmail', 'bodyText', 'normalizedText', 'category', 'attentionStatus', 'duplicateOfMessageId'];
        this._populateFields = ['assignedTo', 'assignedSession', 'closedBy'];
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

        if (Array.isArray(category) && category.length > 0) {
            query.category = {$in: category};
        } else if (typeof category === "string" && category) {
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

    async findByMessageIds(messageIds: string[], mailboxValues: string[] = []): Promise<IInboundEmail[]> {
        if (!messageIds.length) return [];
        const query: Record<string, any> = {messageId: {$in: messageIds}};
        if (mailboxValues.length) query.mailbox = {$in: mailboxValues};

        return await this._model.find(query)
            .populate(this._populateFields)
            .sort({receivedAt: 1})
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
            .select(this.managementListSelect)
            .populate({path: "assignedTo", select: "_id name username email"})
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

    async managementCounts(options: InboundEmailManagementCountsOptions): Promise<InboundEmailManagementCounts> {
        if (!options.mailboxValues.length) {
            return {PENDING: 0, ASSIGNED_TO_ME: 0, ASSIGNED_IN_ATTENTION: 0, ASSIGNED: 0};
        }

        const userObjectId = this.toObjectId(options.currentUserId);
        if (!userObjectId) {
            return {PENDING: 0, ASSIGNED_TO_ME: 0, ASSIGNED_IN_ATTENTION: 0, ASSIGNED: 0};
        }

        const [result] = await this._model.aggregate([
            {
                $match: {
                    mailbox: {$in: options.mailboxValues},
                    attentionStatus: {$in: ["PENDING", "ASSIGNED"]},
                },
            },
            {
                $facet: {
                    pending: [
                        {$match: {attentionStatus: "PENDING"}},
                        {$count: "count"},
                    ],
                    assignedToMe: [
                        {
                            $match: {
                                attentionStatus: "ASSIGNED",
                                assignedTo: userObjectId,
                                $or: [
                                    {assignmentMode: "MANUAL"},
                                    {assignmentMode: null},
                                    {assignmentMode: {$exists: false}},
                                ],
                            },
                        },
                        {$count: "count"},
                    ],
                    assignedInAttention: [
                        {
                            $match: {
                                attentionStatus: "ASSIGNED",
                                assignedTo: userObjectId,
                                assignmentMode: "AUTO",
                            },
                        },
                        {$count: "count"},
                    ],
                    assigned: [
                        {
                            $match: {
                                attentionStatus: "ASSIGNED",
                                ...(options.isSupervisor ? {} : {assignedTo: userObjectId}),
                            },
                        },
                        {$count: "count"},
                    ],
                },
            },
            {
                $project: {
                    PENDING: {$ifNull: [{$arrayElemAt: ["$pending.count", 0]}, 0]},
                    ASSIGNED_TO_ME: {$ifNull: [{$arrayElemAt: ["$assignedToMe.count", 0]}, 0]},
                    ASSIGNED_IN_ATTENTION: {$ifNull: [{$arrayElemAt: ["$assignedInAttention.count", 0]}, 0]},
                    ASSIGNED: {$ifNull: [{$arrayElemAt: ["$assigned.count", 0]}, 0]},
                },
            },
        ]).exec() as InboundEmailManagementCounts[];

        return result || {PENDING: 0, ASSIGNED_TO_ME: 0, ASSIGNED_IN_ATTENTION: 0, ASSIGNED: 0};
    }

    async findThread(inboundEmail: IInboundEmail): Promise<IInboundEmail[]> {
        const parentInboundEmailId = this.resolveEntityId(inboundEmail.parentInboundEmail);
        const inboundEmailIds = [inboundEmail._id, parentInboundEmailId].filter(Boolean);
        const threadIds = this.uniqueStrings([
            inboundEmail.threadId,
            inboundEmail.messageId,
            inboundEmail.inReplyTo,
            ...(inboundEmail.references || []),
        ]);
        const query: Record<string, any> = {
            mailbox: inboundEmail.mailbox,
            $or: [
                {_id: {$in: inboundEmailIds}},
                {parentInboundEmail: {$in: inboundEmailIds}},
                {threadId: {$in: threadIds}},
                {messageId: {$in: threadIds}},
            ],
        };

        return await this._model.find(query)
            .populate(this._populateFields)
            .sort({receivedAt: 1})
            .lean(this._lean)
            .exec() as IInboundEmail[];
    }

    private resolveEntityId(value: any): string | undefined {
        if (!value) return undefined;
        if (typeof value === "object") return value._id?.toString() || value.id?.toString();
        return value.toString();
    }

    private uniqueStrings(values: Array<string | undefined | null>): string[] {
        return [...new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value)))];
    }

    async assignToMe(id: string, userId: string, force = false): Promise<IInboundEmail | null> {
        const assignmentFilter = force
            ? {attentionStatus: {$in: ["PENDING", "ASSIGNED"]}}
            : {attentionStatus: "PENDING", $or: [{assignedTo: {$exists: false}}, {assignedTo: null}]};
        return await this._model.findOneAndUpdate(
            {_id: id, ...assignmentFilter},
            {$set: {attentionStatus: "ASSIGNED", assignedTo: userId, assignedAt: new Date(), assignmentMode: "MANUAL"}, $unset: {assignedSession: ""}},
            {new: true}
        ).populate(this._populateFields).lean(this._lean).exec() as IInboundEmail | null;
    }

    async assignNextPendingAuto(mailboxValues: string[], userId: string, sessionId: string): Promise<IInboundEmail | null> {
        if (!mailboxValues.length) return null;
        const now = new Date();
        return await this._model.findOneAndUpdate(
            {
                mailbox: {$in: mailboxValues},
                attentionStatus: "PENDING",
                $or: [{assignedTo: {$exists: false}}, {assignedTo: null}],
            },
            {
                $set: {
                    attentionStatus: "ASSIGNED",
                    assignedTo: userId,
                    assignedAt: now,
                    assignedSession: sessionId,
                    assignmentMode: "AUTO",
                },
            },
            {sort: {receivedAt: 1}, new: true}
        ).populate(this._populateFields).lean(this._lean).exec() as IInboundEmail | null;
    }

    async releaseAutoAssignedBySession(sessionId: string, userId: string): Promise<number> {
        const result = await this._model.updateMany(
            {
                assignedSession: sessionId,
                assignedTo: userId,
                attentionStatus: "ASSIGNED",
                assignmentMode: "AUTO",
            },
            {
                $set: {
                    attentionStatus: "PENDING",
                    assignedTo: null,
                    assignedAt: null,
                    assignmentMode: null,
                },
                $unset: {assignedSession: ""},
            }
        ).exec();
        return result.modifiedCount || 0;
    }

    async reassign(id: string, userId: string | null): Promise<IInboundEmail | null> {
        return await this._model.findByIdAndUpdate(
            id,
            {
                $set: {attentionStatus: userId ? "ASSIGNED" : "PENDING", assignedTo: userId, assignedAt: userId ? new Date() : null, assignmentMode: userId ? "MANUAL" : null},
                $unset: {assignedSession: ""}
            },
            {new: true}
        ).populate(this._populateFields).lean(this._lean).exec() as IInboundEmail | null;
    }

    async countAssignedToUser(mailboxValues: string[], userId: string): Promise<number> {
        return await this._model.countDocuments({
            mailbox: {$in: mailboxValues},
            assignedTo: userId,
            attentionStatus: "ASSIGNED",
            assignmentMode: "AUTO",
        }).exec();
    }

    async countAssignedByUser(mailboxValues: string[]): Promise<Record<string, number>> {
        if (!mailboxValues.length) return {};
        const rows = await this._model.aggregate([
            {
                $match: {
                    mailbox: {$in: mailboxValues},
                    attentionStatus: "ASSIGNED",
                    assignedTo: {$ne: null},
                    assignmentMode: "AUTO",
                },
            },
            {
                $group: {
                    _id: "$assignedTo",
                    count: {$sum: 1},
                },
            },
        ]).exec() as Array<{_id: any, count: number}>;
        return rows.reduce((acc, row) => {
            const key = row._id?.toString();
            if (key) acc[key] = row.count;
            return acc;
        }, {} as Record<string, number>);
    }

    async supervisionCounts(mailboxValues: string[], closedFrom: Date, closedTo: Date) {
        if (!mailboxValues.length) {
            return {pendingEmails: 0, assignedEmails: 0, closedToday: 0, oldestPendingReceivedAt: null};
        }

        const [statusRows, closedToday, oldestPending] = await Promise.all([
            this._model.aggregate([
                {
                    $match: {
                        mailbox: {$in: mailboxValues},
                        attentionStatus: {$in: ["PENDING", "ASSIGNED"]},
                    },
                },
                {
                    $group: {
                        _id: "$attentionStatus",
                        count: {$sum: 1},
                    },
                },
            ]).exec() as Promise<Array<{_id: string, count: number}>>,
            this._model.countDocuments({
                mailbox: {$in: mailboxValues},
                attentionStatus: "CLOSED",
                closedAt: {$gte: closedFrom, $lt: closedTo},
            }).exec(),
            this._model.findOne({
                mailbox: {$in: mailboxValues},
                attentionStatus: "PENDING",
            }).sort({receivedAt: 1}).select("receivedAt").lean().exec() as Promise<{receivedAt?: Date} | null>,
        ]);

        const byStatus = new Map(statusRows.map((row) => [row._id, row.count]));
        return {
            pendingEmails: byStatus.get("PENDING") || 0,
            assignedEmails: byStatus.get("ASSIGNED") || 0,
            closedToday,
            oldestPendingReceivedAt: oldestPending?.receivedAt || null,
        };
    }

    async findAssignedLiteByUser(mailboxValues: string[], userId: string): Promise<any[]> {
        if (!mailboxValues.length || !userId) return [];
        return await this._model.find({
            mailbox: {$in: mailboxValues},
            assignedTo: userId,
            attentionStatus: "ASSIGNED",
        })
            .select("_id subject fromName fromEmail receivedAt assignedAt category priority attentionStatus")
            .sort({assignedAt: 1, receivedAt: 1})
            .lean(this._lean)
            .exec() as any[];
    }

    async updateClassification(id: string, data: InboundEmailClassificationUpdate): Promise<IInboundEmail | null> {
        const $set: Record<string, any> = {};
        const $unset: Record<string, ""> = {};
        Object.entries(data).forEach(([key, value]) => {
            if (value === null) {
                $unset[key] = "";
                return;
            }
            if (value !== undefined) $set[key] = value;
        });
        const update: Record<string, any> = {};
        if (Object.keys($set).length) update.$set = $set;
        if (Object.keys($unset).length) update.$unset = $unset;
        return await this._model.findByIdAndUpdate(id, update, {new: true})
            .populate(this._populateFields)
            .lean(this._lean)
            .exec() as IInboundEmail | null;
    }

    async closeManagement(id: string, closeReason?: string | null, closedBy?: string | null): Promise<IInboundEmail | null> {
        const $set: Record<string, any> = {attentionStatus: "CLOSED", closedAt: new Date()};
        if (closeReason) $set.closeReason = closeReason;
        if (closedBy) {
            $set.closedBy = closedBy;
            $set.assignedTo = closedBy;
            $set.assignedAt = new Date();
            $set.assignmentMode = "MANUAL";
        }
        return await this._model.findByIdAndUpdate(id, {$set}, {new: true})
            .populate(this._populateFields)
            .lean(this._lean)
            .exec() as IInboundEmail | null;
    }

    async reopenAndAssignToMe(id: string, userId: string): Promise<IInboundEmail | null> {
        return await this._model.findOneAndUpdate(
            {_id: id, attentionStatus: "CLOSED"},
            {
                $set: {attentionStatus: "ASSIGNED", assignedTo: userId, assignedAt: new Date(), assignmentMode: "MANUAL"},
                $unset: {assignedSession: "", closedAt: "", closedBy: ""},
            },
            {new: true}
        ).populate(this._populateFields).lean(this._lean).exec() as IInboundEmail | null;
    }

    private async buildManagementQuery(options: InboundEmailManagementListOptions) {
        const query: Record<string, any> = {};
        if (options.mailboxValues?.length) query.mailbox = {$in: options.mailboxValues};
        if (options.attentionStatus) query.attentionStatus = options.attentionStatus;
        if (options.assignedTo) query.assignedTo = options.assignedTo;
        if (options.assignmentMode === "AUTO") query.assignmentMode = "AUTO";
        if (options.assignmentMode === "MANUAL") {
            query.$and = [
                ...(query.$and || []),
                {$or: [{assignmentMode: "MANUAL"}, {assignmentMode: null}, {assignmentMode: {$exists: false}}]},
            ];
        }
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
            const regex = new RegExp(escapeRegExp(options.search.trim()), "i");
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

    private toObjectId(value?: string) {
        return value && mongoose.Types.ObjectId.isValid(value)
            ? new mongoose.Types.ObjectId(value)
            : null;
    }

}

export default InboundEmailMongoRepository
export {InboundEmailMongoRepository}
