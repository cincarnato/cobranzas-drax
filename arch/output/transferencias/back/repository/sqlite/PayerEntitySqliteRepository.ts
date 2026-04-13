
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IPayerEntityRepository} from '../../interfaces/IPayerEntityRepository'
import type {IPayerEntity, IPayerEntityBase} from "../../interfaces/IPayerEntity";
import {SqliteTableField} from "@drax/common-back";

class PayerEntitySqliteRepository extends AbstractSqliteRepository<IPayerEntity, IPayerEntityBase, IPayerEntityBase> implements IPayerEntityRepository {

    protected db: any;
    protected tableName: string = 'PayerEntity';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['cuilCuit', 'nombre'];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = ['cuentas', 'afiliados'];
    protected identifier: string = '_id';
    protected populateFields = [
        
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "cuilCuit", type: "TEXT", unique: true, primary: false},
{name: "nombre", type: "TEXT", unique: undefined, primary: false},
{name: "cuentas", type: "TEXT", unique: undefined, primary: false},
{name: "afiliados", type: "TEXT", unique: undefined, primary: false},
{name: "ultimaVezDetectado", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default PayerEntitySqliteRepository
export {PayerEntitySqliteRepository}

