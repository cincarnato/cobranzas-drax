import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IMailboxRepository} from '../../interfaces/IMailboxRepository'
import type {IMailbox, IMailboxBase} from "../../interfaces/IMailbox";
import {SqliteTableField} from "@drax/common-back";

class MailboxSqliteRepository extends AbstractSqliteRepository<IMailbox, IMailboxBase, IMailboxBase> implements IMailboxRepository {

    protected db: any;
    protected tableName: string = 'Mailbox';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['name', 'email', 'username', 'imapHost', 'popHost', 'smtpHost'];
    protected booleanFields: string[] = ['isActive', 'autoProcessEnabled', 'attachmentStorageEnabled', 'attachmentOcrEnabled', 'imapEnabled', 'imapTls', 'popEnabled', 'popTls', 'smtpEnabled', 'smtpTls'];
    protected jsonFields: string[] = ['categories', 'entities', 'sentiments', 'priorities', 'tags'];
    protected identifier: string = 'email';
    protected populateFields = []
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "name", type: "TEXT", unique: true, primary: false},
        {name: "email", type: "TEXT", unique: true, primary: false},
        {name: "username", type: "TEXT", unique: undefined, primary: false},
        {name: "password", type: "TEXT", unique: undefined, primary: false},
        {name: "categories", type: "TEXT", unique: undefined, primary: false},
        {name: "entities", type: "TEXT", unique: undefined, primary: false},
        {name: "sentiments", type: "TEXT", unique: undefined, primary: false},
        {name: "priorities", type: "TEXT", unique: undefined, primary: false},
        {name: "tags", type: "TEXT", unique: undefined, primary: false},
        {name: "isActive", type: "TEXT", unique: undefined, primary: false},
        {name: "autoProcessEnabled", type: "TEXT", unique: undefined, primary: false},
        {name: "attachmentStorageEnabled", type: "TEXT", unique: undefined, primary: false},
        {name: "attachmentOcrEnabled", type: "TEXT", unique: undefined, primary: false},
        {name: "processingProtocol", type: "TEXT", unique: undefined, primary: false},
        {name: "processingIntervalMinutes", type: "REAL", unique: undefined, primary: false},
        {name: "processingIntervalMinutes", type: "TEXT", unique: undefined, primary: false},
        {name: "imapEnabled", type: "TEXT", unique: undefined, primary: false},
        {name: "imapHost", type: "TEXT", unique: undefined, primary: false},
        {name: "imapPort", type: "REAL", unique: undefined, primary: false},
        {name: "imapPort", type: "TEXT", unique: undefined, primary: false},
        {name: "imapTls", type: "TEXT", unique: undefined, primary: false},
        {name: "popEnabled", type: "TEXT", unique: undefined, primary: false},
        {name: "popHost", type: "TEXT", unique: undefined, primary: false},
        {name: "popPort", type: "REAL", unique: undefined, primary: false},
        {name: "popPort", type: "TEXT", unique: undefined, primary: false},
        {name: "popTls", type: "TEXT", unique: undefined, primary: false},
        {name: "smtpEnabled", type: "TEXT", unique: undefined, primary: false},
        {name: "smtpHost", type: "TEXT", unique: undefined, primary: false},
        {name: "smtpPort", type: "REAL", unique: undefined, primary: false},
        {name: "smtpPort", type: "TEXT", unique: undefined, primary: false},
        {name: "smtpTls", type: "TEXT", unique: undefined, primary: false}
    ]

}

export default MailboxSqliteRepository
export {MailboxSqliteRepository}
