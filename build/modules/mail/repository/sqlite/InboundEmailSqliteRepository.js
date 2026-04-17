import { AbstractSqliteRepository } from "@drax/crud-back";
class InboundEmailSqliteRepository extends AbstractSqliteRepository {
    constructor() {
        super(...arguments);
        this.tableName = 'InboundEmail';
        this.searchFields = ['messageId', 'threadId', 'mailbox', 'subject', 'fromName', 'fromEmail', 'replyToEmail', 'bodyText', 'normalizedText', 'attachmentsOcrText', 'category', 'duplicateOfMessageId'];
        this.booleanFields = ['hasAttachments', 'isDuplicate'];
        this.jsonFields = ['toEmails', 'ccEmails', 'attachments', 'tags', 'customer', 'extractedEntities'];
        this.identifier = 'messageId';
        this.populateFields = [];
        this.verbose = false;
        this.tableFields = [
            { name: "messageId", type: "TEXT", unique: true, primary: false },
            { name: "threadId", type: "TEXT", unique: undefined, primary: false },
            { name: "mailbox", type: "TEXT", unique: undefined, primary: false },
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
            { name: "isDuplicate", type: "TEXT", unique: undefined, primary: false },
            { name: "duplicateOfMessageId", type: "TEXT", unique: undefined, primary: false },
            { name: "processedAt", type: "TEXT", unique: undefined, primary: false }
        ];
    }
}
export default InboundEmailSqliteRepository;
export { InboundEmailSqliteRepository };
