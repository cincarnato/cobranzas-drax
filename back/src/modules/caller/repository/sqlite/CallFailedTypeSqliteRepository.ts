
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {ICallFailedTypeRepository} from '../../interfaces/ICallFailedTypeRepository'
import type {ICallFailedType, ICallFailedTypeBase} from "../../interfaces/ICallFailedType";
import {SqliteTableField} from "@drax/common-back";

class CallFailedTypeSqliteRepository extends AbstractSqliteRepository<ICallFailedType, ICallFailedTypeBase, ICallFailedTypeBase> implements ICallFailedTypeRepository {

    protected db: any;
    protected tableName: string = 'CallFailedType';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['name'];
    protected booleanFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "name", type: "TEXT", unique: undefined, primary: false},
{name: "color", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default CallFailedTypeSqliteRepository
export {CallFailedTypeSqliteRepository}

