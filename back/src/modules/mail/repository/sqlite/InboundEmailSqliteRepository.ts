import {AbstractSqliteRepository} from "@drax/crud-back";
import type {
    FindInboundEmailsByProcessMarkOptions,
    IInboundEmailRepository,
    InboundEmailClassificationUpdate,
    InboundEmailManagementListOptions,
    InboundEmailManagementListResult
} from '../../interfaces/IInboundEmailRepository'
import type {IInboundEmail, IInboundEmailBase} from "../../interfaces/IInboundEmail";
import {SqliteTableField} from "@drax/common-back";

class InboundEmailSqliteRepository extends AbstractSqliteRepository<IInboundEmail, IInboundEmailBase, IInboundEmailBase> implements IInboundEmailRepository {

    protected db: any;
    protected tableName: string = 'InboundEmail';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['messageId', 'threadId', 'mailbox', 'subject', 'fromName', 'fromEmail', 'replyToEmail', 'bodyText', 'normalizedText', 'attachmentsOcrText', 'attachmentsOcrError', 'category', 'closeReason', 'attentionStatus', 'duplicateOfMessageId'];
    protected booleanFields: string[] = ['hasAttachments', 'isDuplicate'];
    protected jsonFields: string[] = ['toEmails', 'ccEmails', 'attachments', 'tags', 'customer', 'extractedEntities', 'processMarks'];
    protected identifier: string = 'messageId';
    protected populateFields = []
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "messageId", type: "TEXT", unique: true, primary: false},
        {name: "threadId", type: "TEXT", unique: undefined, primary: false},
        {name: "mailbox", type: "TEXT", unique: undefined, primary: false},
        {name: "imapUid", type: "REAL", unique: undefined, primary: false},
        {name: "sourceChannel", type: "TEXT", unique: undefined, primary: false},
        {name: "receivedAt", type: "TEXT", unique: undefined, primary: false},
        {name: "subject", type: "TEXT", unique: undefined, primary: false},
        {name: "fromName", type: "TEXT", unique: undefined, primary: false},
        {name: "fromEmail", type: "TEXT", unique: undefined, primary: false},
        {name: "toEmails", type: "TEXT", unique: undefined, primary: false},
        {name: "ccEmails", type: "TEXT", unique: undefined, primary: false},
        {name: "replyToEmail", type: "TEXT", unique: undefined, primary: false},
        {name: "assignedTo", type: "TEXT", unique: undefined, primary: false},
        {name: "assignedAt", type: "TEXT", unique: undefined, primary: false},
        {name: "attentionStatus", type: "TEXT", unique: undefined, primary: false},
        {name: "replyCount", type: "REAL", unique: undefined, primary: false},
        {name: "firstRepliedAt", type: "TEXT", unique: undefined, primary: false},
        {name: "lastRepliedAt", type: "TEXT", unique: undefined, primary: false},
        {name: "bodyText", type: "TEXT", unique: undefined, primary: false},
        {name: "bodyHtml", type: "TEXT", unique: undefined, primary: false},
        {name: "normalizedText", type: "TEXT", unique: undefined, primary: false},
        {name: "hasAttachments", type: "TEXT", unique: undefined, primary: false},
        {name: "attachmentCount", type: "REAL", unique: undefined, primary: false},
        {name: "attachments", type: "TEXT", unique: undefined, primary: false},
        {name: "attachmentsOcrText", type: "TEXT", unique: undefined, primary: false},
        {name: "attachmentsOcrError", type: "TEXT", unique: undefined, primary: false},
        {name: "category", type: "TEXT", unique: undefined, primary: false},
        {name: "closeReason", type: "TEXT", unique: undefined, primary: false},
        {name: "sentiment", type: "TEXT", unique: undefined, primary: false},
        {name: "priority", type: "TEXT", unique: undefined, primary: false},
        {name: "summary", type: "TEXT", unique: undefined, primary: false},
        {name: "tags", type: "TEXT", unique: undefined, primary: false},
        {name: "aiModel", type: "TEXT", unique: undefined, primary: false},
        {name: "customer", type: "TEXT", unique: undefined, primary: false},
        {name: "extractedEntities", type: "TEXT", unique: undefined, primary: false},
        {name: "processingStatus", type: "TEXT", unique: undefined, primary: false},
        {name: "reviewStatus", type: "TEXT", unique: undefined, primary: false},
        {name: "processMarks", type: "TEXT", unique: undefined, primary: false},
        {name: "isDuplicate", type: "TEXT", unique: undefined, primary: false},
        {name: "duplicateOfMessageId", type: "TEXT", unique: undefined, primary: false},
        {name: "processedAt", type: "TEXT", unique: undefined, primary: false}
    ]

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
        const safeOrderBy = this.tableFields.some((field) => field.name === orderBy) ? orderBy : "receivedAt";
        const safeOrder = order === "desc" ? "DESC" : "ASC";
        const where: string[] = [
            "processingStatus = @processingStatus",
            `(
                processMarks IS NULL
                OR processMarks = ''
                OR NOT EXISTS (
                    SELECT 1
                    FROM json_each(COALESCE(NULLIF(processMarks, ''), '[]')) AS processMark
                    WHERE json_extract(processMark.value, '$.key') = @processMarkKey
                )
                OR EXISTS (
                    SELECT 1
                    FROM json_each(COALESCE(NULLIF(processMarks, ''), '[]')) AS processMark
                    WHERE json_extract(processMark.value, '$.key') = @processMarkKey
                      AND json_extract(processMark.value, '$.status') = @retryStatus
                      AND CAST(COALESCE(json_extract(processMark.value, '$.attempts'), 0) AS INTEGER) < @maxAttempts
                )
            )`,
        ];
        const params: Record<string, unknown> = {
            processingStatus,
            processMarkKey,
            retryStatus,
            maxAttempts,
            limit,
        };

        if (since) {
            where.push("receivedAt >= @since");
            params.since = since instanceof Date ? since.toISOString() : since;
        }

        if (category) {
            where.push("category = @category");
            params.category = category;
        }

        const items = this.db
            .prepare(`SELECT *
                      FROM ${this.tableName}
                      WHERE ${where.join(" AND ")}
                      ORDER BY ${safeOrderBy} ${safeOrder}
                      LIMIT @limit`)
            .all(params) as IInboundEmail[];

        for (const item of items) {
            await this.decorate(item);
        }

        return items;
    }

    async managementPaginate(options: InboundEmailManagementListOptions): Promise<InboundEmailManagementListResult> {
        const page = Math.max(Number(options.page || 1), 1);
        const pageSize = Math.min(Math.max(Number(options.pageSize || 25), 1), 100);
        const filters: any[] = [];
        if (options.mailboxValues?.length) filters.push({field: "mailbox", operator: "in", value: options.mailboxValues});
        if (options.attentionStatus) filters.push({field: "attentionStatus", operator: "eq", value: options.attentionStatus});
        if (options.assignedTo) filters.push({field: "assignedTo", operator: "eq", value: options.assignedTo});
        if (options.category) filters.push({field: "category", operator: "eq", value: options.category});
        if (typeof options.hasAttachments === "boolean") filters.push({field: "hasAttachments", operator: "eq", value: options.hasAttachments});
        if (options.withoutReply) filters.push({field: "replyCount", operator: "eq", value: 0});
        const result = await this.paginate({
            page,
            limit: pageSize,
            orderBy: options.sortBy || "receivedAt",
            order: options.sortDirection || "desc",
            search: options.search || "",
            filters,
        });
        const totalItems = (result as any).total || 0;
        return {
            items: (result.items || []) as any,
            page,
            pageSize,
            totalItems,
            totalPages: Math.max(Math.ceil(totalItems / pageSize), 1),
        };
    }

    async findThread(inboundEmail: IInboundEmail): Promise<IInboundEmail[]> {
        const filters: any[] = inboundEmail.threadId
            ? [{field: "threadId", operator: "eq", value: inboundEmail.threadId}]
            : [{field: "_id", operator: "eq", value: inboundEmail._id}];
        return await this.find({limit: 100, orderBy: "receivedAt", order: "asc", filters});
    }

    async assignToMe(id: string, userId: string, force = false): Promise<IInboundEmail | null> {
        const item = await this.findById(id);
        if (!item || (force ? !["PENDING", "ASSIGNED"].includes(String(item.attentionStatus)) : (item.attentionStatus !== "PENDING" || item.assignedTo))) return null;
        return await this.update(id, {...item, attentionStatus: "ASSIGNED", assignedTo: userId, assignedAt: new Date()});
    }

    async reassign(id: string, userId: string | null): Promise<IInboundEmail | null> {
        const item = await this.findById(id);
        if (!item) return null;
        return await this.update(id, {...item, attentionStatus: userId ? "ASSIGNED" : "PENDING", assignedTo: userId, assignedAt: userId ? new Date() : null});
    }

    async countAssignedToUser(mailboxValues: string[], userId: string): Promise<number> {
        if (!mailboxValues.length) return 0;
        const placeholders = mailboxValues.map((_, index) => `@mailbox${index}`).join(", ");
        const params: Record<string, unknown> = {
            userId,
        };
        mailboxValues.forEach((value, index) => {
            params[`mailbox${index}`] = value;
        });
        const result = this.db
            .prepare(`SELECT COUNT(*) AS total
                      FROM ${this.tableName}
                      WHERE mailbox IN (${placeholders})
                        AND assignedTo = @userId
                        AND attentionStatus = 'ASSIGNED'`)
            .get(params) as {total?: number};
        return Number(result?.total || 0);
    }

    async updateClassification(id: string, data: InboundEmailClassificationUpdate): Promise<IInboundEmail | null> {
        const item = await this.findById(id);
        if (!item) return null;
        return await this.update(id, {...item, ...data});
    }

    async closeManagement(id: string, closeReason?: string | null): Promise<IInboundEmail | null> {
        const item = await this.findById(id);
        if (!item) return null;
        return await this.update(id, {...item, attentionStatus: "CLOSED", closeReason: closeReason || item.closeReason});
    }

}

export default InboundEmailSqliteRepository
export {InboundEmailSqliteRepository}
