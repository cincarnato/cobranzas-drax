import {AbstractSqliteRepository} from "@drax/crud-back";
import type {
    FindInboundEmailsByProcessMarkOptions,
    IInboundEmailRepository,
    InboundEmailClassificationUpdate,
    InboundEmailAssignedLite,
    InboundEmailManagementListOptions,
    InboundEmailManagementListResult,
    InboundEmailSupervisionCounts
} from '../../interfaces/IInboundEmailRepository'
import type {IInboundEmail, IInboundEmailBase} from "../../interfaces/IInboundEmail";
import {SqliteTableField} from "@drax/common-back";

class InboundEmailSqliteRepository extends AbstractSqliteRepository<IInboundEmail, IInboundEmailBase, IInboundEmailBase> implements IInboundEmailRepository {

    protected db: any;
    protected tableName: string = 'InboundEmail';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['messageId', 'threadId', 'inReplyTo', 'mailbox', 'subject', 'fromName', 'fromEmail', 'replyToEmail', 'bodyText', 'normalizedText', 'attachmentsOcrText', 'attachmentsOcrError', 'category', 'closeReason', 'attentionStatus', 'duplicateOfMessageId'];
    protected booleanFields: string[] = ['hasAttachments', 'isDuplicate'];
    protected jsonFields: string[] = ['references', 'toEmails', 'ccEmails', 'attachments', 'tags', 'customer', 'extractedEntities', 'processMarks'];
    protected identifier: string = 'messageId';
    protected populateFields = []
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "messageId", type: "TEXT", unique: true, primary: false},
        {name: "threadId", type: "TEXT", unique: undefined, primary: false},
        {name: "inReplyTo", type: "TEXT", unique: undefined, primary: false},
        {name: "references", type: "TEXT", unique: undefined, primary: false},
        {name: "parentInboundEmail", type: "TEXT", unique: undefined, primary: false},
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
        {name: "assignedSession", type: "TEXT", unique: undefined, primary: false},
        {name: "assignmentMode", type: "TEXT", unique: undefined, primary: false},
        {name: "attentionStatus", type: "TEXT", unique: undefined, primary: false},
        {name: "replyCount", type: "REAL", unique: undefined, primary: false},
        {name: "firstRepliedAt", type: "TEXT", unique: undefined, primary: false},
        {name: "lastRepliedAt", type: "TEXT", unique: undefined, primary: false},
        {name: "closedAt", type: "TEXT", unique: undefined, primary: false},
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

    async findByMessageIds(messageIds: string[], mailboxValues: string[] = []): Promise<IInboundEmail[]> {
        if (!messageIds.length) return [];
        const messagePlaceholders = messageIds.map((_, index) => `@messageId${index}`).join(", ");
        const params: Record<string, unknown> = {};
        messageIds.forEach((value, index) => {
            params[`messageId${index}`] = value;
        });

        let mailboxCondition = "";
        if (mailboxValues.length) {
            const mailboxPlaceholders = mailboxValues.map((_, index) => `@mailbox${index}`).join(", ");
            mailboxValues.forEach((value, index) => {
                params[`mailbox${index}`] = value;
            });
            mailboxCondition = ` AND mailbox IN (${mailboxPlaceholders})`;
        }

        const items = this.db
            .prepare(`SELECT * FROM ${this.tableName} WHERE messageId IN (${messagePlaceholders})${mailboxCondition} ORDER BY receivedAt ASC`)
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
        if (options.assignmentMode) filters.push({field: "assignmentMode", operator: "eq", value: options.assignmentMode});
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
        const parentInboundEmailId = this.resolveEntityId(inboundEmail.parentInboundEmail);
        const inboundEmailIds = this.uniqueStrings([inboundEmail._id, parentInboundEmailId]);
        const threadIds = this.uniqueStrings([
            inboundEmail.threadId,
            inboundEmail.messageId,
            inboundEmail.inReplyTo,
            ...(inboundEmail.references || []),
        ]);
        const params: Record<string, unknown> = {mailbox: inboundEmail.mailbox};
        const clauses: string[] = [];

        if (inboundEmailIds.length) {
            const placeholders = inboundEmailIds.map((_, index) => `@inboundEmailId${index}`).join(", ");
            inboundEmailIds.forEach((value, index) => {
                params[`inboundEmailId${index}`] = value;
            });
            clauses.push(`_id IN (${placeholders})`);
            clauses.push(`parentInboundEmail IN (${placeholders})`);
        }

        if (threadIds.length) {
            const placeholders = threadIds.map((_, index) => `@threadId${index}`).join(", ");
            threadIds.forEach((value, index) => {
                params[`threadId${index}`] = value;
            });
            clauses.push(`threadId IN (${placeholders})`);
            clauses.push(`messageId IN (${placeholders})`);
        }

        const items = this.db
            .prepare(`SELECT * FROM ${this.tableName} WHERE mailbox = @mailbox AND (${clauses.join(" OR ")}) ORDER BY receivedAt ASC LIMIT 100`)
            .all(params) as IInboundEmail[];
        for (const item of items) {
            await this.decorate(item);
        }
        return items;
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
        const item = await this.findById(id);
        if (!item || (force ? !["PENDING", "ASSIGNED"].includes(String(item.attentionStatus)) : (item.attentionStatus !== "PENDING" || item.assignedTo))) return null;
        return await this.update(id, {...item, attentionStatus: "ASSIGNED", assignedTo: userId, assignedAt: new Date(), assignedSession: null, assignmentMode: "MANUAL"});
    }

    async assignNextPendingAuto(mailboxValues: string[], userId: string, sessionId: string): Promise<IInboundEmail | null> {
        if (!mailboxValues.length) return null;
        const placeholders = mailboxValues.map((_, index) => `@mailbox${index}`).join(", ");
        const params: Record<string, unknown> = {};
        mailboxValues.forEach((value, index) => {
            params[`mailbox${index}`] = value;
        });
        const item = this.db
            .prepare(`SELECT * FROM ${this.tableName}
                      WHERE mailbox IN (${placeholders})
                        AND attentionStatus = 'PENDING'
                        AND (assignedTo IS NULL OR assignedTo = '')
                      ORDER BY receivedAt ASC
                      LIMIT 1`)
            .get(params) as IInboundEmail | undefined;
        if (!item) return null;
        await this.decorate(item);
        return await this.update(item._id, {...item, attentionStatus: "ASSIGNED", assignedTo: userId, assignedAt: new Date(), assignedSession: sessionId, assignmentMode: "AUTO"});
    }

    async releaseAutoAssignedBySession(sessionId: string, userId: string): Promise<number> {
        const result = this.db
            .prepare(`UPDATE ${this.tableName}
                      SET attentionStatus = 'PENDING',
                          assignedTo = NULL,
                          assignedAt = NULL,
                          assignedSession = NULL,
                          assignmentMode = NULL
                      WHERE assignedSession = @sessionId
                        AND assignedTo = @userId
                        AND attentionStatus = 'ASSIGNED'
                        AND assignmentMode = 'AUTO'`)
            .run({sessionId, userId});
        return Number(result?.changes || 0);
    }

    async reassign(id: string, userId: string | null): Promise<IInboundEmail | null> {
        const item = await this.findById(id);
        if (!item) return null;
        return await this.update(id, {...item, attentionStatus: userId ? "ASSIGNED" : "PENDING", assignedTo: userId, assignedAt: userId ? new Date() : null, assignedSession: null, assignmentMode: userId ? "MANUAL" : null});
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

    async countAssignedByUser(mailboxValues: string[]): Promise<Record<string, number>> {
        if (!mailboxValues.length) return {};
        const placeholders = mailboxValues.map((_, index) => `@mailbox${index}`).join(", ");
        const params: Record<string, unknown> = {};
        mailboxValues.forEach((value, index) => {
            params[`mailbox${index}`] = value;
        });
        const rows = this.db
            .prepare(`SELECT assignedTo AS userId, COUNT(*) AS total
                      FROM ${this.tableName}
                      WHERE mailbox IN (${placeholders})
                        AND attentionStatus = 'ASSIGNED'
                        AND assignedTo IS NOT NULL
                        AND assignedTo != ''
                      GROUP BY assignedTo`)
            .all(params) as Array<{userId?: string, total?: number}>;
        return rows.reduce((acc, row) => {
            if (row.userId) acc[row.userId] = Number(row.total || 0);
            return acc;
        }, {} as Record<string, number>);
    }

    async supervisionCounts(mailboxValues: string[], closedFrom: Date, closedTo: Date): Promise<InboundEmailSupervisionCounts> {
        if (!mailboxValues.length) return {pendingEmails: 0, assignedEmails: 0, closedToday: 0};
        const placeholders = mailboxValues.map((_, index) => `@mailbox${index}`).join(", ");
        const params: Record<string, unknown> = {
            closedFrom: closedFrom.toISOString(),
            closedTo: closedTo.toISOString(),
        };
        mailboxValues.forEach((value, index) => {
            params[`mailbox${index}`] = value;
        });
        const rows = this.db
            .prepare(`SELECT attentionStatus AS status, COUNT(*) AS total
                      FROM ${this.tableName}
                      WHERE mailbox IN (${placeholders})
                        AND attentionStatus IN ('PENDING', 'ASSIGNED')
                      GROUP BY attentionStatus`)
            .all(params) as Array<{status?: string, total?: number}>;
        const closed = this.db
            .prepare(`SELECT COUNT(*) AS total
                      FROM ${this.tableName}
                      WHERE mailbox IN (${placeholders})
                        AND attentionStatus = 'CLOSED'
                        AND closedAt >= @closedFrom
                        AND closedAt < @closedTo`)
            .get(params) as {total?: number};
        const byStatus = new Map(rows.map((row) => [row.status, Number(row.total || 0)]));
        return {
            pendingEmails: byStatus.get("PENDING") || 0,
            assignedEmails: byStatus.get("ASSIGNED") || 0,
            closedToday: Number(closed?.total || 0),
        };
    }

    async findAssignedLiteByUser(mailboxValues: string[], userId: string): Promise<InboundEmailAssignedLite[]> {
        if (!mailboxValues.length || !userId) return [];
        const placeholders = mailboxValues.map((_, index) => `@mailbox${index}`).join(", ");
        const params: Record<string, unknown> = {userId};
        mailboxValues.forEach((value, index) => {
            params[`mailbox${index}`] = value;
        });
        return this.db
            .prepare(`SELECT _id, subject, fromName, fromEmail, receivedAt, assignedAt, category, priority, attentionStatus
                      FROM ${this.tableName}
                      WHERE mailbox IN (${placeholders})
                        AND assignedTo = @userId
                        AND attentionStatus = 'ASSIGNED'
                      ORDER BY assignedAt ASC, receivedAt ASC`)
            .all(params) as InboundEmailAssignedLite[];
    }

    async updateClassification(id: string, data: InboundEmailClassificationUpdate): Promise<IInboundEmail | null> {
        const item = await this.findById(id);
        if (!item) return null;
        return await this.update(id, {...item, ...data});
    }

    async closeManagement(id: string, closeReason?: string | null): Promise<IInboundEmail | null> {
        const item = await this.findById(id);
        if (!item) return null;
        return await this.update(id, {...item, attentionStatus: "CLOSED", closedAt: new Date(), closeReason: closeReason || item.closeReason});
    }

    async reopenAndAssignToMe(id: string, userId: string): Promise<IInboundEmail | null> {
        const item = await this.findById(id);
        if (!item || item.attentionStatus !== "CLOSED") return null;
        return await this.update(id, {
            ...item,
            attentionStatus: "ASSIGNED",
            assignedTo: userId,
            assignedAt: new Date(),
            assignedSession: null,
            assignmentMode: "MANUAL",
            closedAt: null,
        });
    }

}

export default InboundEmailSqliteRepository
export {InboundEmailSqliteRepository}
