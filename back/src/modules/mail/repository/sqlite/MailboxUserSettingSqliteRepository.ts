
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IMailboxUserSettingRepository} from '../../interfaces/IMailboxUserSettingRepository'
import type {IMailboxUserSetting, IMailboxUserSettingBase} from "../../interfaces/IMailboxUserSetting";
import {SqliteTableField} from "@drax/common-back";

class MailboxUserSettingSqliteRepository extends AbstractSqliteRepository<IMailboxUserSetting, IMailboxUserSettingBase, IMailboxUserSettingBase> implements IMailboxUserSettingRepository {

    protected db: any;
    protected tableName: string = 'MailboxUserSetting';
    protected dataBaseFile: string;
    protected searchFields: string[] = [];
    protected booleanFields: string[] = ['autoAdvanceOnClose'];
    protected jsonFields: string[] = [];
    protected identifier: string = 'mailbox';
    protected populateFields = [
        { field: 'mailbox', table: 'mailbox', identifier: '_id' },
{ field: 'user', table: 'user', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "mailbox", type: "TEXT", unique: undefined, primary: false},
{name: "user", type: "TEXT", unique: undefined, primary: false},
{name: "signatureHtml", type: "TEXT", unique: undefined, primary: false},
{name: "signatureText", type: "TEXT", unique: undefined, primary: false},
{name: "autoAdvanceOnClose", type: "TEXT", unique: undefined, primary: false}
    ]

    async findByMailboxAndUser(mailboxId: string, userId: string): Promise<IMailboxUserSetting | null> {
        const item = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE mailbox = ? AND user = ? LIMIT 1`).get(mailboxId, userId) as IMailboxUserSetting | undefined;
        if (item) await this.decorate(item);
        return item || null;
    }

    async upsertForMailboxAndUser(mailboxId: string, userId: string, data: Partial<IMailboxUserSettingBase>): Promise<IMailboxUserSetting> {
        const current = await this.findByMailboxAndUser(mailboxId, userId);
        if (current?._id) {
            return await this.update(current._id, {...current, ...data, mailbox: mailboxId, user: userId});
        }
        return await this.create({mailbox: mailboxId, user: userId, signatureHtml: "", signatureText: "", autoAdvanceOnClose: false, ...data});
    }
  
}

export default MailboxUserSettingSqliteRepository
export {MailboxUserSettingSqliteRepository}
