
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {ICallLogRepository} from '../../interfaces/ICallLogRepository'
import type {ICallLog, ICallLogBase} from "../../interfaces/ICallLog";
import {SqliteTableField} from "@drax/common-back";

class CallLogSqliteRepository extends AbstractSqliteRepository<ICallLog, ICallLogBase, ICallLogBase> implements ICallLogRepository {

    protected db: any;
    protected tableName: string = 'CallLog';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['typification'];
    protected booleanFields: string[] = ['done'];
    protected jsonFields: string[] = ['data'];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'callList', table: 'callList', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "callList", type: "TEXT", unique: undefined, primary: false},
{name: "attempts", type: "FLOAT", unique: undefined, primary: false},
{name: "attempts", type: "TEXT", unique: undefined, primary: false},
{name: "notes", type: "TEXT", unique: undefined, primary: false},
{name: "typification", type: "TEXT", unique: undefined, primary: false},
{name: "state", type: "TEXT", unique: undefined, primary: false},
{name: "promiseDate", type: "TEXT", unique: undefined, primary: false},
{name: "done", type: "TEXT", unique: undefined, primary: false},
{name: "data", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default CallLogSqliteRepository
export {CallLogSqliteRepository}

