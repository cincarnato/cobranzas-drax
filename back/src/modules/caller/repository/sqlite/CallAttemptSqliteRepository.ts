import {AbstractSqliteRepository} from "@drax/crud-back";
import type {ICallAttemptRepository} from '../../interfaces/ICallAttemptRepository'
import type {ICallAttempt, ICallAttemptBase} from "../../interfaces/ICallAttempt";
import {SqliteTableField} from "@drax/common-back";

class CallAttemptSqliteRepository extends AbstractSqliteRepository<ICallAttempt, ICallAttemptBase, ICallAttemptBase> implements ICallAttemptRepository {

    protected db: any;
    protected tableName: string = 'CallAttempt';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['result', 'callListName', 'callLogId'];
    protected booleanFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'user', table: 'user', identifier: '_id' },
        { field: 'callLog', table: 'CallLog', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "date", type: "TEXT", unique: undefined, primary: false},
        {name: "user", type: "TEXT", unique: undefined, primary: false},
        {name: "result", type: "TEXT", unique: undefined, primary: false},
        {name: "callListName", type: "TEXT", unique: undefined, primary: false},
        {name: "callLogId", type: "TEXT", unique: undefined, primary: false},
        {name: "callLog", type: "TEXT", unique: undefined, primary: false}
    ]

}

export default CallAttemptSqliteRepository
export {CallAttemptSqliteRepository}
