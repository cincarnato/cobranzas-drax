import { AbstractMongoRepository } from "@drax/crud-back";
import { InboundEmailModel } from "../../models/InboundEmailModel.js";
import { EmailUserStateModel } from "../../models/EmailUserStateModel.js";
import { mongoose } from "@drax/common-back";
class InboundEmailMongoRepository extends AbstractMongoRepository {
    constructor() {
        super();
        this._model = InboundEmailModel;
        this._searchFields = ['messageId', 'threadId', 'mailbox', 'subject', 'fromName', 'fromEmail', 'replyToEmail', 'bodyText', 'normalizedText', 'category', 'attentionStatus', 'duplicateOfMessageId'];
        this._populateFields = ['assignedTo', 'assignedSession', 'closedBy'];
        this._lean = true;
    }
    async findByProcessMarkStatus({ processMarkKey, processingStatus = "PROCESSED", category = null, retryStatus = "FAILED", maxAttempts = 2, since = null, limit = 10, orderBy = "receivedAt", order = "asc", }) {
        const query = {
            processingStatus,
            $or: [
                { processMarks: { $not: { $elemMatch: { key: processMarkKey } } } },
                { processMarks: { $elemMatch: { key: processMarkKey, status: retryStatus, attempts: { $lt: maxAttempts } } } },
                { processMarks: { $elemMatch: { key: processMarkKey, status: retryStatus, attempts: { $exists: false } } } },
            ],
        };
        if (since) {
            query.receivedAt = { $gte: since };
        }
        if (category) {
            query.category = category;
        }
        const sort = {
            [orderBy]: order === "desc" ? -1 : 1,
        };
        return await this._model
            .find(query)
            .limit(limit)
            .sort(sort)
            .lean(this._lean)
            .exec();
    }
    async findByMessageIds(messageIds, mailboxValues = []) {
        if (!messageIds.length)
            return [];
        const query = { messageId: { $in: messageIds } };
        if (mailboxValues.length)
            query.mailbox = { $in: mailboxValues };
        return await this._model.find(query)
            .populate(this._populateFields)
            .sort({ receivedAt: 1 })
            .lean(this._lean)
            .exec();
    }
    async managementPaginate(options) {
        const page = Math.max(Number(options.page || 1), 1);
        const pageSize = Math.min(Math.max(Number(options.pageSize || 25), 1), 100);
        const query = await this.buildManagementQuery(options);
        const sortBy = this.safeSortBy(options.sortBy || "receivedAt");
        const sortDirection = options.sortDirection === "asc" ? 1 : -1;
        const totalItems = await this._model.countDocuments(query).exec();
        const items = await this._model.find(query)
            .populate(this._populateFields)
            .sort({ [sortBy]: sortDirection })
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .lean(this._lean)
            .exec();
        return {
            items: await this.attachUserStates(items, options.currentUserId),
            page,
            pageSize,
            totalItems,
            totalPages: Math.max(Math.ceil(totalItems / pageSize), 1),
        };
    }
    async managementCounts(options) {
        if (!options.mailboxValues.length) {
            return { PENDING: 0, ASSIGNED_TO_ME: 0, ASSIGNED_IN_ATTENTION: 0, ASSIGNED: 0 };
        }
        const userObjectId = this.toObjectId(options.currentUserId);
        if (!userObjectId) {
            return { PENDING: 0, ASSIGNED_TO_ME: 0, ASSIGNED_IN_ATTENTION: 0, ASSIGNED: 0 };
        }
        const [result] = await this._model.aggregate([
            {
                $match: {
                    mailbox: { $in: options.mailboxValues },
                    attentionStatus: { $in: ["PENDING", "ASSIGNED"] },
                },
            },
            {
                $facet: {
                    pending: [
                        { $match: { attentionStatus: "PENDING" } },
                        { $count: "count" },
                    ],
                    assignedToMe: [
                        {
                            $match: {
                                attentionStatus: "ASSIGNED",
                                assignedTo: userObjectId,
                                $or: [
                                    { assignmentMode: "MANUAL" },
                                    { assignmentMode: null },
                                    { assignmentMode: { $exists: false } },
                                ],
                            },
                        },
                        { $count: "count" },
                    ],
                    assignedInAttention: [
                        {
                            $match: {
                                attentionStatus: "ASSIGNED",
                                assignedTo: userObjectId,
                                assignmentMode: "AUTO",
                            },
                        },
                        { $count: "count" },
                    ],
                    assigned: [
                        {
                            $match: {
                                attentionStatus: "ASSIGNED",
                                ...(options.isSupervisor ? {} : { assignedTo: userObjectId }),
                            },
                        },
                        { $count: "count" },
                    ],
                },
            },
            {
                $project: {
                    PENDING: { $ifNull: [{ $arrayElemAt: ["$pending.count", 0] }, 0] },
                    ASSIGNED_TO_ME: { $ifNull: [{ $arrayElemAt: ["$assignedToMe.count", 0] }, 0] },
                    ASSIGNED_IN_ATTENTION: { $ifNull: [{ $arrayElemAt: ["$assignedInAttention.count", 0] }, 0] },
                    ASSIGNED: { $ifNull: [{ $arrayElemAt: ["$assigned.count", 0] }, 0] },
                },
            },
        ]).exec();
        return result || { PENDING: 0, ASSIGNED_TO_ME: 0, ASSIGNED_IN_ATTENTION: 0, ASSIGNED: 0 };
    }
    async findThread(inboundEmail) {
        const parentInboundEmailId = this.resolveEntityId(inboundEmail.parentInboundEmail);
        const inboundEmailIds = [inboundEmail._id, parentInboundEmailId].filter(Boolean);
        const threadIds = this.uniqueStrings([
            inboundEmail.threadId,
            inboundEmail.messageId,
            inboundEmail.inReplyTo,
            ...(inboundEmail.references || []),
        ]);
        const query = {
            mailbox: inboundEmail.mailbox,
            $or: [
                { _id: { $in: inboundEmailIds } },
                { parentInboundEmail: { $in: inboundEmailIds } },
                { threadId: { $in: threadIds } },
                { messageId: { $in: threadIds } },
            ],
        };
        return await this._model.find(query)
            .populate(this._populateFields)
            .sort({ receivedAt: 1 })
            .lean(this._lean)
            .exec();
    }
    resolveEntityId(value) {
        if (!value)
            return undefined;
        if (typeof value === "object")
            return value._id?.toString() || value.id?.toString();
        return value.toString();
    }
    uniqueStrings(values) {
        return [...new Set(values.map((value) => value?.trim()).filter((value) => Boolean(value)))];
    }
    async assignToMe(id, userId, force = false) {
        const assignmentFilter = force
            ? { attentionStatus: { $in: ["PENDING", "ASSIGNED"] } }
            : { attentionStatus: "PENDING", $or: [{ assignedTo: { $exists: false } }, { assignedTo: null }] };
        return await this._model.findOneAndUpdate({ _id: id, ...assignmentFilter }, { $set: { attentionStatus: "ASSIGNED", assignedTo: userId, assignedAt: new Date(), assignmentMode: "MANUAL" }, $unset: { assignedSession: "" } }, { new: true }).populate(this._populateFields).lean(this._lean).exec();
    }
    async assignNextPendingAuto(mailboxValues, userId, sessionId) {
        if (!mailboxValues.length)
            return null;
        const now = new Date();
        return await this._model.findOneAndUpdate({
            mailbox: { $in: mailboxValues },
            attentionStatus: "PENDING",
            $or: [{ assignedTo: { $exists: false } }, { assignedTo: null }],
        }, {
            $set: {
                attentionStatus: "ASSIGNED",
                assignedTo: userId,
                assignedAt: now,
                assignedSession: sessionId,
                assignmentMode: "AUTO",
            },
        }, { sort: { receivedAt: 1 }, new: true }).populate(this._populateFields).lean(this._lean).exec();
    }
    async releaseAutoAssignedBySession(sessionId, userId) {
        const result = await this._model.updateMany({
            assignedSession: sessionId,
            assignedTo: userId,
            attentionStatus: "ASSIGNED",
            assignmentMode: "AUTO",
        }, {
            $set: {
                attentionStatus: "PENDING",
                assignedTo: null,
                assignedAt: null,
                assignmentMode: null,
            },
            $unset: { assignedSession: "" },
        }).exec();
        return result.modifiedCount || 0;
    }
    async reassign(id, userId) {
        return await this._model.findByIdAndUpdate(id, {
            $set: { attentionStatus: userId ? "ASSIGNED" : "PENDING", assignedTo: userId, assignedAt: userId ? new Date() : null, assignmentMode: userId ? "MANUAL" : null },
            $unset: { assignedSession: "" }
        }, { new: true }).populate(this._populateFields).lean(this._lean).exec();
    }
    async countAssignedToUser(mailboxValues, userId) {
        return await this._model.countDocuments({
            mailbox: { $in: mailboxValues },
            assignedTo: userId,
            attentionStatus: "ASSIGNED",
        }).exec();
    }
    async countAssignedByUser(mailboxValues) {
        if (!mailboxValues.length)
            return {};
        const rows = await this._model.aggregate([
            {
                $match: {
                    mailbox: { $in: mailboxValues },
                    attentionStatus: "ASSIGNED",
                    assignedTo: { $ne: null },
                },
            },
            {
                $group: {
                    _id: "$assignedTo",
                    count: { $sum: 1 },
                },
            },
        ]).exec();
        return rows.reduce((acc, row) => {
            const key = row._id?.toString();
            if (key)
                acc[key] = row.count;
            return acc;
        }, {});
    }
    async supervisionCounts(mailboxValues, closedFrom, closedTo) {
        if (!mailboxValues.length) {
            return { pendingEmails: 0, assignedEmails: 0, closedToday: 0 };
        }
        const [statusRows, closedToday] = await Promise.all([
            this._model.aggregate([
                {
                    $match: {
                        mailbox: { $in: mailboxValues },
                        attentionStatus: { $in: ["PENDING", "ASSIGNED"] },
                    },
                },
                {
                    $group: {
                        _id: "$attentionStatus",
                        count: { $sum: 1 },
                    },
                },
            ]).exec(),
            this._model.countDocuments({
                mailbox: { $in: mailboxValues },
                attentionStatus: "CLOSED",
                closedAt: { $gte: closedFrom, $lt: closedTo },
            }).exec(),
        ]);
        const byStatus = new Map(statusRows.map((row) => [row._id, row.count]));
        return {
            pendingEmails: byStatus.get("PENDING") || 0,
            assignedEmails: byStatus.get("ASSIGNED") || 0,
            closedToday,
        };
    }
    async findAssignedLiteByUser(mailboxValues, userId) {
        if (!mailboxValues.length || !userId)
            return [];
        return await this._model.find({
            mailbox: { $in: mailboxValues },
            assignedTo: userId,
            attentionStatus: "ASSIGNED",
        })
            .select("_id subject fromName fromEmail receivedAt assignedAt category priority attentionStatus")
            .sort({ assignedAt: 1, receivedAt: 1 })
            .lean(this._lean)
            .exec();
    }
    async updateClassification(id, data) {
        const $set = {};
        const $unset = {};
        Object.entries(data).forEach(([key, value]) => {
            if (value === null) {
                $unset[key] = "";
                return;
            }
            if (value !== undefined)
                $set[key] = value;
        });
        const update = {};
        if (Object.keys($set).length)
            update.$set = $set;
        if (Object.keys($unset).length)
            update.$unset = $unset;
        return await this._model.findByIdAndUpdate(id, update, { new: true })
            .populate(this._populateFields)
            .lean(this._lean)
            .exec();
    }
    async closeManagement(id, closeReason, closedBy) {
        const $set = { attentionStatus: "CLOSED", closedAt: new Date() };
        if (closeReason)
            $set.closeReason = closeReason;
        if (closedBy) {
            $set.closedBy = closedBy;
            $set.assignedTo = closedBy;
            $set.assignedAt = new Date();
            $set.assignmentMode = "MANUAL";
        }
        return await this._model.findByIdAndUpdate(id, { $set }, { new: true })
            .populate(this._populateFields)
            .lean(this._lean)
            .exec();
    }
    async reopenAndAssignToMe(id, userId) {
        return await this._model.findOneAndUpdate({ _id: id, attentionStatus: "CLOSED" }, {
            $set: { attentionStatus: "ASSIGNED", assignedTo: userId, assignedAt: new Date(), assignmentMode: "MANUAL" },
            $unset: { assignedSession: "", closedAt: "", closedBy: "" },
        }, { new: true }).populate(this._populateFields).lean(this._lean).exec();
    }
    async buildManagementQuery(options) {
        const query = {};
        if (options.mailboxValues?.length)
            query.mailbox = { $in: options.mailboxValues };
        if (options.attentionStatus)
            query.attentionStatus = options.attentionStatus;
        if (options.assignedTo)
            query.assignedTo = options.assignedTo;
        if (options.assignmentMode === "AUTO")
            query.assignmentMode = "AUTO";
        if (options.assignmentMode === "MANUAL") {
            query.$and = [
                ...(query.$and || []),
                { $or: [{ assignmentMode: "MANUAL" }, { assignmentMode: null }, { assignmentMode: { $exists: false } }] },
            ];
        }
        if (options.category)
            query.category = options.category;
        if (options.priorities?.length)
            query.priority = { $in: options.priorities };
        if (options.tags?.length)
            query.tags = { $all: options.tags };
        if (typeof options.hasAttachments === "boolean")
            query.hasAttachments = options.hasAttachments;
        if (options.withoutReply)
            query.replyCount = { $in: [0, null] };
        if (options.dateFrom || options.dateTo) {
            query.receivedAt = {};
            if (options.dateFrom)
                query.receivedAt.$gte = options.dateFrom;
            if (options.dateTo)
                query.receivedAt.$lte = options.dateTo;
        }
        if (options.search?.trim()) {
            const regex = new RegExp(this.escapeRegExp(options.search.trim()), "i");
            query.$or = [
                { subject: regex },
                { fromName: regex },
                { fromEmail: regex },
                { normalizedText: regex },
                { bodyText: regex },
                { attachmentsOcrText: regex },
                { "customer.name": regex },
                { "customer.documentNumber": regex },
                { "customer.cuil": regex },
                { "extractedEntities.value": regex },
            ];
        }
        if (options.starredOnly && options.currentUserId) {
            const states = await EmailUserStateModel.find({ user: options.currentUserId, isStarred: true }).select("inboundEmail").lean(this._lean).exec();
            query._id = { $in: states.map((state) => state.inboundEmail) };
        }
        return query;
    }
    async attachUserStates(items, userId) {
        if (!userId || !items.length)
            return items;
        const states = await EmailUserStateModel.find({
            user: userId,
            inboundEmail: { $in: items.map((item) => item._id) }
        }).lean(this._lean).exec();
        const byEmail = new Map(states.map((state) => [state.inboundEmail?.toString(), state]));
        return items.map((item) => ({ ...item, userState: byEmail.get(item._id?.toString()) || null }));
    }
    safeSortBy(sortBy) {
        return ["receivedAt", "subject", "fromName", "fromEmail", "attentionStatus", "priority", "category"].includes(sortBy) ? sortBy : "receivedAt";
    }
    escapeRegExp(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    toObjectId(value) {
        return value && mongoose.Types.ObjectId.isValid(value)
            ? new mongoose.Types.ObjectId(value)
            : null;
    }
}
export default InboundEmailMongoRepository;
export { InboundEmailMongoRepository };
