import { AbstractSqliteRepository } from "@drax/crud-back";
class AffiliateSqliteRepository extends AbstractSqliteRepository {
    constructor() {
        super(...arguments);
        this.tableName = 'Affiliate';
        this.searchFields = ['apellidoNombre', 'dni', 'cuilCuit', 'tipo', 'titular', 'titularDni'];
        this.booleanFields = [];
        this.jsonFields = [];
        this.identifier = '_id';
        this.populateFields = [
            { field: 'titular', table: 'titular', identifier: '_id' }
        ];
        this.verbose = false;
        this.tableFields = [
            { name: "apellidoNombre", type: "TEXT", unique: undefined, primary: false },
            { name: "dni", type: "TEXT", unique: true, primary: false },
            { name: "cuilCuit", type: "TEXT", unique: undefined, primary: false },
            { name: "tipo", type: "TEXT", unique: undefined, primary: false },
            { name: "titular", type: "TEXT", unique: undefined, primary: false },
            { name: "titularDni", type: "TEXT", unique: true, primary: false }
        ];
    }
}
export default AffiliateSqliteRepository;
export { AffiliateSqliteRepository };
