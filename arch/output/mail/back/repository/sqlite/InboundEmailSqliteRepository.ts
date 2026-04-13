
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IInboundEmailRepository} from '../../interfaces/IInboundEmailRepository'
import type {IInboundEmail, IInboundEmailBase} from "../../interfaces/IInboundEmail";
import {SqliteTableField} from "@drax/common-back";

class InboundEmailSqliteRepository extends AbstractSqliteRepository<IInboundEmail, IInboundEmailBase, IInboundEmailBase> implements IInboundEmailRepository {

    protected db: any;
    protected tableName: string = 'InboundEmail';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['messageId', 'threadId', 'mailbox', 'subject', 'fromName', 'fromEmail', 'replyToEmail', 'bodyText', 'normalizedText', 'category', 'duplicateOfMessageId'];
    protected booleanFields: string[] = ['hasAttachments', 'needsHumanReview', 'autoApproved', 'isDuplicate'];
    protected jsonFields: string[] = ['toEmails', 'ccEmails', 'attachments', 'tags', 'extractedData'];
    protected identifier: string = 'messageId';
    protected populateFields = [
        
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "messageId", type: "TEXT", unique: true, primary: false},
{name: "threadId", type: "TEXT", unique: undefined, primary: false},
{name: "mailbox", type: "TEXT", unique: undefined, primary: false},
{name: "sourceChannel", type: "TEXT", unique: undefined, primary: false},
{name: "receivedAt", type: "TEXT", unique: undefined, primary: false},
{name: "subject", type: "TEXT", unique: undefined, primary: false},
{name: "fromName", type: "TEXT", unique: undefined, primary: false},
{name: "fromEmail", type: "TEXT", unique: undefined, primary: false},
{name: "toEmails", type: "TEXT", unique: undefined, primary: false},
{name: "ccEmails", type: "TEXT", unique: undefined, primary: false},
{name: "replyToEmail", type: "TEXT", unique: undefined, primary: false},
{name: "bodyText", type: "TEXT", unique: undefined, primary: false},
{name: "bodyHtml", type: "TEXT", unique: undefined, primary: false},
{name: "normalizedText", type: "TEXT", unique: undefined, primary: false},
{name: "hasAttachments", type: "TEXT", unique: undefined, primary: false},
{name: "attachmentCount", type: "FLOAT", unique: undefined, primary: false},
{name: "attachmentCount", type: "TEXT", unique: undefined, primary: false},
{name: "attachments", type: "TEXT", unique: undefined, primary: false},
{name: "category", type: "TEXT", unique: undefined, primary: false},
{name: "sentiment", type: "TEXT", unique: undefined, primary: false},
{name: "urgency", type: "TEXT", unique: undefined, primary: false},
{name: "summary", type: "TEXT", unique: undefined, primary: false},
{name: "tags", type: "TEXT", unique: undefined, primary: false},
{name: "aiModel", type: "TEXT", unique: undefined, primary: false},
{name: "extractedData", type: "TEXT", unique: undefined, primary: false},
{name: "processingStatus", type: "TEXT", unique: undefined, primary: false},
{name: "reviewStatus", type: "TEXT", unique: undefined, primary: false},
{name: "needsHumanReview", type: "TEXT", unique: undefined, primary: false},
{name: "autoApproved", type: "TEXT", unique: undefined, primary: false},
{name: "isDuplicate", type: "TEXT", unique: undefined, primary: false},
{name: "duplicateOfMessageId", type: "TEXT", unique: undefined, primary: false},
{name: "rejectionReason", type: "TEXT", unique: undefined, primary: false},
{name: "validationNotes", type: "TEXT", unique: undefined, primary: false},
{name: "rawExtractionJson", type: "TEXT", unique: undefined, primary: false},
{name: "processedAt", type: "TEXT", unique: undefined, primary: false},
{name: "lastErrorAt", type: "TEXT", unique: undefined, primary: false},
{name: "lastErrorMessage", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default InboundEmailSqliteRepository
export {InboundEmailSqliteRepository}

