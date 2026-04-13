
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IAffiliateTypeRepository} from '../../interfaces/IAffiliateTypeRepository'
import type {IAffiliateType, IAffiliateTypeBase} from "../../interfaces/IAffiliateType";
import {SqliteTableField} from "@drax/common-back";

class AffiliateTypeSqliteRepository extends AbstractSqliteRepository<IAffiliateType, IAffiliateTypeBase, IAffiliateTypeBase> implements IAffiliateTypeRepository {

    protected db: any;
    protected tableName: string = 'AffiliateType';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['nombre'];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "nombre", type: "TEXT", unique: undefined, primary: false},
{name: "descripcion", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default AffiliateTypeSqliteRepository
export {AffiliateTypeSqliteRepository}

