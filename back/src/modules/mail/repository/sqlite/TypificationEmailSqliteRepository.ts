
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {ITypificationEmailRepository} from '../../interfaces/ITypificationEmailRepository'
import type {ITypificationEmail, ITypificationEmailBase} from "../../interfaces/ITypificationEmail";
import {SqliteTableField} from "@drax/common-back";

class TypificationEmailSqliteRepository extends AbstractSqliteRepository<ITypificationEmail, ITypificationEmailBase, ITypificationEmailBase> implements ITypificationEmailRepository {

    protected db: any;
    protected tableName: string = 'TypificationEmail';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['name', 'description'];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = [];
    protected identifier: string = 'name';
    protected populateFields = [
        
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "name", type: "TEXT", unique: true, primary: false},
{name: "description", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default TypificationEmailSqliteRepository
export {TypificationEmailSqliteRepository}

