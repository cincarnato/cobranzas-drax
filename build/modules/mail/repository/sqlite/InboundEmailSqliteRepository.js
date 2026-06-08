import { AbstractSqliteRepository } from "@drax/crud-back";
class InboundEmailSqliteRepository extends AbstractSqliteRepository {
    constructor() {
        super(...arguments);
        this.tableName = 'InboundEmail';
        this.searchFields = ['messageId', 'threadId', 'mailbox', 'subject', 'fromName', 'fromEmail', 'replyToEmail', 'bodyText', 'normalizedText', 'attachmentsOcrText', 'attachmentsOcrError', 'category', 'duplicateOfMessageId'];
        this.booleanFields = ['hasAttachments', 'isDuplicate'];
        this.jsonFields = ['toEmails', 'ccEmails', 'attachments', 'tags', 'customer', 'extractedEntities', 'processMarks'];
        this.identifier = 'messageId';
        this.populateFields = [];
        this.verbose = false;
        this.tableFields = [
            { name: "messageId", type: "TEXT", unique: true, primary: false },
            { name: "threadId", type: "TEXT", unique: undefined, primary: false },
            { name: "mailbox", type: "TEXT", unique: undefined, primary: false },
            { name: "imapUid", type: "REAL", unique: undefined, primary: false },
            { name: "sourceChannel", type: "TEXT", unique: undefined, primary: false },
            { name: "receivedAt", type: "TEXT", unique: undefined, primary: false },
            { name: "subject", type: "TEXT", unique: undefined, primary: false },
            { name: "fromName", type: "TEXT", unique: undefined, primary: false },
            { name: "fromEmail", type: "TEXT", unique: undefined, primary: false },
            { name: "toEmails", type: "TEXT", unique: undefined, primary: false },
            { name: "ccEmails", type: "TEXT", unique: undefined, primary: false },
            { name: "replyToEmail", type: "TEXT", unique: undefined, primary: false },
            { name: "bodyText", type: "TEXT", unique: undefined, primary: false },
            { name: "bodyHtml", type: "TEXT", unique: undefined, primary: false },
            { name: "normalizedText", type: "TEXT", unique: undefined, primary: false },
            { name: "hasAttachments", type: "TEXT", unique: undefined, primary: false },
            { name: "attachmentCount", type: "REAL", unique: undefined, primary: false },
            { name: "attachments", type: "TEXT", unique: undefined, primary: false },
            { name: "attachmentsOcrText", type: "TEXT", unique: undefined, primary: false },
            { name: "attachmentsOcrError", type: "TEXT", unique: undefined, primary: false },
            { name: "category", type: "TEXT", unique: undefined, primary: false },
            { name: "sentiment", type: "TEXT", unique: undefined, primary: false },
            { name: "priority", type: "TEXT", unique: undefined, primary: false },
            { name: "summary", type: "TEXT", unique: undefined, primary: false },
            { name: "tags", type: "TEXT", unique: undefined, primary: false },
            { name: "aiModel", type: "TEXT", unique: undefined, primary: false },
            { name: "customer", type: "TEXT", unique: undefined, primary: false },
            { name: "extractedEntities", type: "TEXT", unique: undefined, primary: false },
            { name: "processingStatus", type: "TEXT", unique: undefined, primary: false },
            { name: "reviewStatus", type: "TEXT", unique: undefined, primary: false },
            { name: "processMarks", type: "TEXT", unique: undefined, primary: false },
            { name: "isDuplicate", type: "TEXT", unique: undefined, primary: false },
            { name: "duplicateOfMessageId", type: "TEXT", unique: undefined, primary: false },
            { name: "processedAt", type: "TEXT", unique: undefined, primary: false }
        ];
    }
    async findByProcessMarkStatus({ processMarkKey, processingStatus = "PROCESSED", category = null, retryStatus = "FAILED", maxAttempts = 2, since = null, limit = 10, orderBy = "receivedAt", order = "asc", }) {
        const safeOrderBy = this.tableFields.some((field) => field.name === orderBy) ? orderBy : "receivedAt";
        const safeOrder = order === "desc" ? "DESC" : "ASC";
        const where = [
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
        const params = {
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
            .all(params);
        for (const item of items) {
            await this.decorate(item);
        }
        return items;
    }
}
export default InboundEmailSqliteRepository;
export { InboundEmailSqliteRepository };
