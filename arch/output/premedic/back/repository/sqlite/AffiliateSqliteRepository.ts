
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IAffiliateRepository} from '../../interfaces/IAffiliateRepository'
import type {IAffiliate, IAffiliateBase} from "../../interfaces/IAffiliate";
import {SqliteTableField} from "@drax/common-back";

class AffiliateSqliteRepository extends AbstractSqliteRepository<IAffiliate, IAffiliateBase, IAffiliateBase> implements IAffiliateRepository {

    protected db: any;
    protected tableName: string = 'Affiliate';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['apellidoNombre', 'dni', 'cuilCuit', 'tipo', 'titular', 'titularDni'];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'titular', table: 'titular', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "apellidoNombre", type: "TEXT", unique: undefined, primary: false},
{name: "dni", type: "TEXT", unique: true, primary: false},
{name: "cuilCuit", type: "TEXT", unique: undefined, primary: false},
{name: "tipo", type: "TEXT", unique: undefined, primary: false},
{name: "titular", type: "TEXT", unique: undefined, primary: false},
{name: "titularDni", type: "TEXT", unique: true, primary: false}
    ]
  
}

export default AffiliateSqliteRepository
export {AffiliateSqliteRepository}

