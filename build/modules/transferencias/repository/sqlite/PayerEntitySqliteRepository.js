import { AbstractSqliteRepository } from "@drax/crud-back";
class PayerEntitySqliteRepository extends AbstractSqliteRepository {
    constructor() {
        super(...arguments);
        this.tableName = 'PayerEntity';
        this.searchFields = ['cuilCuit', 'nombre'];
        this.booleanFields = [];
        this.jsonFields = ['cuentas', 'afiliados'];
        this.identifier = '_id';
        this.populateFields = [];
        this.verbose = false;
        this.tableFields = [
            { name: "cuilCuit", type: "TEXT", unique: true, primary: false },
            { name: "nombre", type: "TEXT", unique: undefined, primary: false },
            { name: "cuentas", type: "TEXT", unique: undefined, primary: false },
            { name: "afiliados", type: "TEXT", unique: undefined, primary: false },
            { name: "ultimaVezDetectado", type: "TEXT", unique: undefined, primary: false }
        ];
    }
}
export default PayerEntitySqliteRepository;
export { PayerEntitySqliteRepository };
