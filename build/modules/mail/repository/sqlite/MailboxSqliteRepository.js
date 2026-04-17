import { AbstractSqliteRepository } from "@drax/crud-back";
class MailboxSqliteRepository extends AbstractSqliteRepository {
    constructor() {
        super(...arguments);
        this.tableName = 'Mailbox';
        this.searchFields = ['name', 'email', 'username', 'imapHost', 'popHost', 'smtpHost'];
        this.booleanFields = ['isActive', 'autoProcessEnabled', 'attachmentStorageEnabled', 'attachmentOcrEnabled', 'imapEnabled', 'imapTls', 'popEnabled', 'popTls', 'smtpEnabled', 'smtpTls'];
        this.jsonFields = ['categories', 'entities', 'sentiments', 'priorities', 'tags'];
        this.identifier = 'email';
        this.populateFields = [];
        this.verbose = false;
        this.tableFields = [
            { name: "name", type: "TEXT", unique: true, primary: false },
            { name: "email", type: "TEXT", unique: true, primary: false },
            { name: "username", type: "TEXT", unique: undefined, primary: false },
            { name: "password", type: "TEXT", unique: undefined, primary: false },
            { name: "categories", type: "TEXT", unique: undefined, primary: false },
            { name: "entities", type: "TEXT", unique: undefined, primary: false },
            { name: "sentiments", type: "TEXT", unique: undefined, primary: false },
            { name: "priorities", type: "TEXT", unique: undefined, primary: false },
            { name: "tags", type: "TEXT", unique: undefined, primary: false },
            { name: "isActive", type: "TEXT", unique: undefined, primary: false },
            { name: "autoProcessEnabled", type: "TEXT", unique: undefined, primary: false },
            { name: "attachmentStorageEnabled", type: "TEXT", unique: undefined, primary: false },
            { name: "attachmentOcrEnabled", type: "TEXT", unique: undefined, primary: false },
            { name: "processingProtocol", type: "TEXT", unique: undefined, primary: false },
            { name: "processingIntervalMinutes", type: "REAL", unique: undefined, primary: false },
            { name: "processingIntervalMinutes", type: "TEXT", unique: undefined, primary: false },
            { name: "imapEnabled", type: "TEXT", unique: undefined, primary: false },
            { name: "imapHost", type: "TEXT", unique: undefined, primary: false },
            { name: "imapPort", type: "REAL", unique: undefined, primary: false },
            { name: "imapPort", type: "TEXT", unique: undefined, primary: false },
            { name: "imapTls", type: "TEXT", unique: undefined, primary: false },
            { name: "popEnabled", type: "TEXT", unique: undefined, primary: false },
            { name: "popHost", type: "TEXT", unique: undefined, primary: false },
            { name: "popPort", type: "REAL", unique: undefined, primary: false },
            { name: "popPort", type: "TEXT", unique: undefined, primary: false },
            { name: "popTls", type: "TEXT", unique: undefined, primary: false },
            { name: "smtpEnabled", type: "TEXT", unique: undefined, primary: false },
            { name: "smtpHost", type: "TEXT", unique: undefined, primary: false },
            { name: "smtpPort", type: "REAL", unique: undefined, primary: false },
            { name: "smtpPort", type: "TEXT", unique: undefined, primary: false },
            { name: "smtpTls", type: "TEXT", unique: undefined, primary: false }
        ];
    }
}
export default MailboxSqliteRepository;
export { MailboxSqliteRepository };
