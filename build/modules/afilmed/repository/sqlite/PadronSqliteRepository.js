import { AbstractSqliteRepository } from "@drax/crud-back";
class PadronSqliteRepository extends AbstractSqliteRepository {
    constructor() {
        super(...arguments);
        this.tableName = 'Padron';
        this.searchFields = ['contra', 'ape_nom', 'domicilio', 'loca', 'nro_ref_elect', 'celular', 'deno_provin'];
        this.booleanFields = [];
        this.jsonFields = [];
        this.identifier = '_id';
        this.populateFields = [];
        this.verbose = false;
        this.tableFields = [
            { name: "origen", type: "TEXT", unique: undefined, primary: false },
            { name: "ente", type: "REAL", unique: undefined, primary: false },
            { name: "ente", type: "TEXT", unique: undefined, primary: false },
            { name: "contra", type: "TEXT", unique: undefined, primary: false },
            { name: "ape_nom", type: "TEXT", unique: undefined, primary: false },
            { name: "cant_inte", type: "REAL", unique: undefined, primary: false },
            { name: "cant_inte", type: "TEXT", unique: undefined, primary: false },
            { name: "plan_codi", type: "TEXT", unique: undefined, primary: false },
            { name: "domicilio", type: "TEXT", unique: undefined, primary: false },
            { name: "loca", type: "TEXT", unique: undefined, primary: false },
            { name: "tele", type: "TEXT", unique: undefined, primary: false },
            { name: "deuda1", type: "REAL", unique: undefined, primary: false },
            { name: "deuda1", type: "TEXT", unique: undefined, primary: false },
            { name: "deuda2", type: "REAL", unique: undefined, primary: false },
            { name: "deuda2", type: "TEXT", unique: undefined, primary: false },
            { name: "deuda3", type: "REAL", unique: undefined, primary: false },
            { name: "deuda3", type: "TEXT", unique: undefined, primary: false },
            { name: "deuda4", type: "REAL", unique: undefined, primary: false },
            { name: "deuda4", type: "TEXT", unique: undefined, primary: false },
            { name: "periodo1", type: "TEXT", unique: undefined, primary: false },
            { name: "periodo2", type: "TEXT", unique: undefined, primary: false },
            { name: "periodo3", type: "TEXT", unique: undefined, primary: false },
            { name: "periodo4", type: "TEXT", unique: undefined, primary: false },
            { name: "subtotal", type: "REAL", unique: undefined, primary: false },
            { name: "subtotal", type: "TEXT", unique: undefined, primary: false },
            { name: "pago_forma", type: "TEXT", unique: undefined, primary: false },
            { name: "cobrador", type: "TEXT", unique: undefined, primary: false },
            { name: "total_ctacte", type: "REAL", unique: undefined, primary: false },
            { name: "total_ctacte", type: "TEXT", unique: undefined, primary: false },
            { name: "baja_fecha", type: "TEXT", unique: undefined, primary: false },
            { name: "nro_ref_elect", type: "TEXT", unique: undefined, primary: false },
            { name: "celular", type: "TEXT", unique: undefined, primary: false },
            { name: "deno_provin", type: "TEXT", unique: undefined, primary: false }
        ];
    }
}
export default PadronSqliteRepository;
export { PadronSqliteRepository };
