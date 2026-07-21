
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IOutboundEmailRepository} from '../../interfaces/IOutboundEmailRepository'
import type {IOutboundEmail, IOutboundEmailBase} from "../../interfaces/IOutboundEmail";
import {SqliteTableField} from "@drax/common-back";

class OutboundEmailSqliteRepository extends AbstractSqliteRepository<IOutboundEmail, IOutboundEmailBase, IOutboundEmailBase> implements IOutboundEmailRepository {

    protected db: any;
    protected tableName: string = 'OutboundEmail';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['fromEmail', 'subject', 'bodyText', 'messageId', 'inReplyTo'];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = ['toEmails', 'ccEmails', 'bccEmails', 'references'];
    protected identifier: string = 'subject';
    protected populateFields = [
        { field: 'inboundEmail', table: 'inboundEmail', identifier: '_id' },
{ field: 'mailbox', table: 'mailbox', identifier: '_id' },
{ field: 'user', table: 'user', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "inboundEmail", type: "TEXT", unique: undefined, primary: false},
{name: "mailbox", type: "TEXT", unique: undefined, primary: false},
{name: "user", type: "TEXT", unique: undefined, primary: false},
{name: "fromEmail", type: "TEXT", unique: undefined, primary: false},
{name: "toEmails", type: "TEXT", unique: undefined, primary: false},
{name: "ccEmails", type: "TEXT", unique: undefined, primary: false},
{name: "bccEmails", type: "TEXT", unique: undefined, primary: false},
{name: "subject", type: "TEXT", unique: undefined, primary: false},
{name: "bodyText", type: "TEXT", unique: undefined, primary: false},
{name: "bodyHtml", type: "TEXT", unique: undefined, primary: false},
{name: "status", type: "TEXT", unique: undefined, primary: false},
{name: "messageId", type: "TEXT", unique: undefined, primary: false},
{name: "inReplyTo", type: "TEXT", unique: undefined, primary: false},
{name: "references", type: "TEXT", unique: undefined, primary: false},
{name: "sentAt", type: "TEXT", unique: undefined, primary: false},
{name: "lastError", type: "TEXT", unique: undefined, primary: false},
{name: "attempts", type: "REAL", unique: undefined, primary: false},
{name: "attempts", type: "TEXT", unique: undefined, primary: false}
    ]

    async findByInboundEmailIds(inboundEmailIds: string[]): Promise<IOutboundEmail[]> {
        if (!inboundEmailIds.length) return [];
        const placeholders = inboundEmailIds.map(() => "?").join(",");
        const items = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE inboundEmail IN (${placeholders}) ORDER BY createdAt ASC`).all(...inboundEmailIds) as IOutboundEmail[];
        for (const item of items) {
            await this.decorate(item);
        }
        return items;
    }
  
}

export default OutboundEmailSqliteRepository
export {OutboundEmailSqliteRepository}
