
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IMailboxUserSettingRepository} from '../../interfaces/IMailboxUserSettingRepository'
import type {IMailboxUserSetting, IMailboxUserSettingBase} from "../../interfaces/IMailboxUserSetting";
import {SqliteTableField} from "@drax/common-back";

class MailboxUserSettingSqliteRepository extends AbstractSqliteRepository<IMailboxUserSetting, IMailboxUserSettingBase, IMailboxUserSettingBase> implements IMailboxUserSettingRepository {

    protected db: any;
    protected tableName: string = 'MailboxUserSetting';
    protected dataBaseFile: string;
    protected searchFields: string[] = [];
    protected booleanFields: string[] = [];
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
{name: "signatureText", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default MailboxUserSettingSqliteRepository
export {MailboxUserSettingSqliteRepository}

