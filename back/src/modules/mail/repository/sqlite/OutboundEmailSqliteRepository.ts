
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
    protected jsonFields: string[] = ['toEmails', 'ccEmails', 'bccEmails', 'attachments', 'references'];
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
{name: "attachments", type: "TEXT", unique: undefined, primary: false},
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

    async findByMessageIds(messageIds: string[]): Promise<IOutboundEmail[]> {
        if (!messageIds.length) return [];
        const placeholders = messageIds.map(() => "?").join(",");
        const items = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE messageId IN (${placeholders}) ORDER BY createdAt ASC`).all(...messageIds) as IOutboundEmail[];
        for (const item of items) {
            await this.decorate(item);
        }
        return items;
    }

    async standalonePaginate(options: {mailboxId: string, page: number, pageSize: number}): Promise<{items: IOutboundEmail[], totalItems: number}> {
        const page = Math.max(Number(options.page || 1), 1);
        const pageSize = Math.min(Math.max(Number(options.pageSize || 25), 1), 100);
        const offset = (page - 1) * pageSize;
        const params = {mailboxId: options.mailboxId, limit: pageSize, offset};
        const where = "mailbox = @mailboxId";
        const items = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE ${where} ORDER BY COALESCE(sentAt, createdAt) DESC LIMIT @limit OFFSET @offset`).all(params) as IOutboundEmail[];
        for (const item of items) {
            await this.decorate(item);
        }
        const total = this.db.prepare(`SELECT COUNT(*) as total FROM ${this.tableName} WHERE ${where}`).get(params) as {total: number};
        return {items, totalItems: total?.total || 0};
    }
  
}

export default OutboundEmailSqliteRepository
export {OutboundEmailSqliteRepository}
