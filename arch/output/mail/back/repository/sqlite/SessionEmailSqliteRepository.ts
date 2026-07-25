
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {ISessionEmailRepository} from '../../interfaces/ISessionEmailRepository'
import type {ISessionEmail, ISessionEmailBase} from "../../interfaces/ISessionEmail";
import {SqliteTableField} from "@drax/common-back";

class SessionEmailSqliteRepository extends AbstractSqliteRepository<ISessionEmail, ISessionEmailBase, ISessionEmailBase> implements ISessionEmailRepository {

    protected db: any;
    protected tableName: string = 'SessionEmail';
    protected dataBaseFile: string;
    protected searchFields: string[] = [];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'mailbox', table: 'mailbox', identifier: '_id' },
{ field: 'user', table: 'user', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "mailbox", type: "TEXT", unique: undefined, primary: false},
{name: "user", type: "TEXT", unique: undefined, primary: false},
{name: "status", type: "TEXT", unique: undefined, primary: false},
{name: "startedAt", type: "TEXT", unique: undefined, primary: false},
{name: "pausedAt", type: "TEXT", unique: undefined, primary: false},
{name: "endedAt", type: "TEXT", unique: undefined, primary: false},
{name: "lastActivityAt", type: "TEXT", unique: undefined, primary: false},
{name: "maxAssignableEmails", type: "FLOAT", unique: undefined, primary: false},
{name: "maxAssignableEmails", type: "TEXT", unique: undefined, primary: false},
{name: "assignedCount", type: "FLOAT", unique: undefined, primary: false},
{name: "assignedCount", type: "TEXT", unique: undefined, primary: false},
{name: "repliedCount", type: "FLOAT", unique: undefined, primary: false},
{name: "repliedCount", type: "TEXT", unique: undefined, primary: false},
{name: "closedCount", type: "FLOAT", unique: undefined, primary: false},
{name: "closedCount", type: "TEXT", unique: undefined, primary: false},
{name: "capacityFillLockedUntil", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default SessionEmailSqliteRepository
export {SessionEmailSqliteRepository}

