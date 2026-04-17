
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IBankMovementRepository} from '../../interfaces/IBankMovementRepository'
import type {IBankMovement, IBankMovementBase} from "../../interfaces/IBankMovement";
import {SqliteTableField} from "@drax/common-back";

class BankMovementSqliteRepository extends AbstractSqliteRepository<IBankMovement, IBankMovementBase, IBankMovementBase> implements IBankMovementRepository {

    protected db: any;
    protected tableName: string = 'BankMovement';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['Fecha', 'Concepto', 'NroCpbte', 'Cod', 'bancoOrigen', 'cuilCuitPagador', 'nombrePagador', 'numeroCuentaPagador'];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'pagadorDetectadoId', table: 'pagadorDetectadoId', identifier: '_id' },
{ field: 'afiliadoId', table: 'afiliadoId', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "Fecha", type: "TEXT", unique: undefined, primary: false},
{name: "Concepto", type: "TEXT", unique: undefined, primary: false},
{name: "NroCpbte", type: "TEXT", unique: undefined, primary: false},
{name: "Debito", type: "FLOAT", unique: undefined, primary: false},
{name: "Debito", type: "TEXT", unique: undefined, primary: false},
{name: "Credito", type: "FLOAT", unique: undefined, primary: false},
{name: "Credito", type: "TEXT", unique: undefined, primary: false},
{name: "Saldo", type: "FLOAT", unique: undefined, primary: false},
{name: "Saldo", type: "TEXT", unique: undefined, primary: false},
{name: "Cod", type: "TEXT", unique: undefined, primary: false},
{name: "fecha", type: "TEXT", unique: undefined, primary: false},
{name: "importe", type: "FLOAT", unique: undefined, primary: false},
{name: "importe", type: "TEXT", unique: undefined, primary: false},
{name: "direccion", type: "TEXT", unique: undefined, primary: false},
{name: "tipoConcepto", type: "TEXT", unique: undefined, primary: false},
{name: "bancoOrigen", type: "TEXT", unique: undefined, primary: false},
{name: "cuilCuitPagador", type: "TEXT", unique: undefined, primary: false},
{name: "nombrePagador", type: "TEXT", unique: undefined, primary: false},
{name: "numeroCuentaPagador", type: "TEXT", unique: undefined, primary: false},
{name: "pagadorDetectadoId", type: "TEXT", unique: undefined, primary: false},
{name: "afiliadoId", type: "TEXT", unique: undefined, primary: false},
{name: "estado", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default BankMovementSqliteRepository
export {BankMovementSqliteRepository}

