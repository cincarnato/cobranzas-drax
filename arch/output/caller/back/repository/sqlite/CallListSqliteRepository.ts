
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {ICallListRepository} from '../../interfaces/ICallListRepository'
import type {ICallList, ICallListBase} from "../../interfaces/ICallList";
import {SqliteTableField} from "@drax/common-back";

class CallListSqliteRepository extends AbstractSqliteRepository<ICallList, ICallListBase, ICallListBase> implements ICallListRepository {

    protected db: any;
    protected tableName: string = 'CallList';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['name'];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = ['attemptsControl', 'headers'];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'group', table: 'group', identifier: '_id' },
{ field: 'user', table: 'user', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "group", type: "TEXT", unique: undefined, primary: false},
{name: "user", type: "TEXT", unique: undefined, primary: false},
{name: "file", type: "TEXT", unique: undefined, primary: false},
{name: "state", type: "TEXT", unique: undefined, primary: false},
{name: "total", type: "FLOAT", unique: undefined, primary: false},
{name: "total", type: "TEXT", unique: undefined, primary: false},
{name: "attempts", type: "FLOAT", unique: undefined, primary: false},
{name: "attempts", type: "TEXT", unique: undefined, primary: false},
{name: "attemptsControl", type: "TEXT", unique: undefined, primary: false},
{name: "success", type: "FLOAT", unique: undefined, primary: false},
{name: "success", type: "TEXT", unique: undefined, primary: false},
{name: "promises", type: "FLOAT", unique: undefined, primary: false},
{name: "promises", type: "TEXT", unique: undefined, primary: false},
{name: "failed", type: "FLOAT", unique: undefined, primary: false},
{name: "failed", type: "TEXT", unique: undefined, primary: false},
{name: "deadline", type: "TEXT", unique: undefined, primary: false},
{name: "name", type: "TEXT", unique: true, primary: false},
{name: "headers", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default CallListSqliteRepository
export {CallListSqliteRepository}

