
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {ICallSuccessTypeRepository} from '../../interfaces/ICallSuccessTypeRepository'
import type {ICallSuccessType, ICallSuccessTypeBase} from "../../interfaces/ICallSuccessType";
import {SqliteTableField} from "@drax/common-back";

class CallSuccessTypeSqliteRepository extends AbstractSqliteRepository<ICallSuccessType, ICallSuccessTypeBase, ICallSuccessTypeBase> implements ICallSuccessTypeRepository {

    protected db: any;
    protected tableName: string = 'CallSuccessType';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['name'];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "name", type: "TEXT", unique: undefined, primary: false},
{name: "color", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default CallSuccessTypeSqliteRepository
export {CallSuccessTypeSqliteRepository}

