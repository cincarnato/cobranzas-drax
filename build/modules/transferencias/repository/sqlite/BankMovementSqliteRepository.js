import { AbstractSqliteRepository } from "@drax/crud-back";
class BankMovementSqliteRepository extends AbstractSqliteRepository {
    constructor() {
        super(...arguments);
        this.tableName = 'BankMovement';
        this.searchFields = ['Fecha', 'Concepto', 'NroCpbte', 'Cod', 'bancoOrigen', 'cuilCuitPagador', 'nombrePagador', 'numeroCuentaPagador'];
        this.booleanFields = [];
        this.jsonFields = [];
        this.identifier = '_id';
        this.populateFields = [
            { field: 'pagadorDetectadoId', table: 'pagadorDetectadoId', identifier: '_id' },
            { field: 'afiliadoId', table: 'afiliadoId', identifier: '_id' }
        ];
        this.verbose = false;
        this.tableFields = [
            { name: "Fecha", type: "TEXT", unique: undefined, primary: false },
            { name: "Concepto", type: "TEXT", unique: undefined, primary: false },
            { name: "NroCpbte", type: "TEXT", unique: undefined, primary: false },
            { name: "Debito", type: "REAL", unique: undefined, primary: false },
            { name: "Debito", type: "TEXT", unique: undefined, primary: false },
            { name: "Credito", type: "REAL", unique: undefined, primary: false },
            { name: "Credito", type: "TEXT", unique: undefined, primary: false },
            { name: "Saldo", type: "REAL", unique: undefined, primary: false },
            { name: "Saldo", type: "TEXT", unique: undefined, primary: false },
            { name: "Cod", type: "TEXT", unique: undefined, primary: false },
            { name: "fecha", type: "TEXT", unique: undefined, primary: false },
            { name: "importe", type: "REAL", unique: undefined, primary: false },
            { name: "importe", type: "TEXT", unique: undefined, primary: false },
            { name: "direccion", type: "TEXT", unique: undefined, primary: false },
            { name: "tipoConcepto", type: "TEXT", unique: undefined, primary: false },
            { name: "bancoOrigen", type: "TEXT", unique: undefined, primary: false },
            { name: "cuilCuitPagador", type: "TEXT", unique: undefined, primary: false },
            { name: "nombrePagador", type: "TEXT", unique: undefined, primary: false },
            { name: "numeroCuentaPagador", type: "TEXT", unique: undefined, primary: false },
            { name: "pagadorDetectadoId", type: "TEXT", unique: undefined, primary: false },
            { name: "afiliadoId", type: "TEXT", unique: undefined, primary: false },
            { name: "estado", type: "TEXT", unique: undefined, primary: false }
        ];
    }
}
export default BankMovementSqliteRepository;
export { BankMovementSqliteRepository };
