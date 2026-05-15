import { AbstractSqliteRepository } from "@drax/crud-back";
class BonusSqliteRepository extends AbstractSqliteRepository {
    constructor() {
        super(...arguments);
        this.tableName = 'Bonus';
        this.searchFields = ['dni', 'fullname', 'plan'];
        this.booleanFields = [];
        this.jsonFields = [];
        this.identifier = '_id';
        this.populateFields = [
            { field: 'createdBy', table: 'createdBy', identifier: '_id' }
        ];
        this.verbose = false;
        this.tableFields = [
            { name: "dni", type: "TEXT", unique: undefined, primary: false },
            { name: "fullname", type: "TEXT", unique: undefined, primary: false },
            { name: "plan", type: "TEXT", unique: undefined, primary: false },
            { name: "appliedMonth", type: "TEXT", unique: undefined, primary: false },
            { name: "paymentMethod", type: "TEXT", unique: undefined, primary: false },
            { name: "bonus", type: "TEXT", unique: undefined, primary: false },
            { name: "bonifiedNetValue", type: "REAL", unique: undefined, primary: false },
            { name: "status", type: "TEXT", unique: undefined, primary: false },
            { name: "observation", type: "TEXT", unique: undefined, primary: false },
            { name: "createdBy", type: "TEXT", unique: undefined, primary: false }
        ];
    }
}
export default BonusSqliteRepository;
export { BonusSqliteRepository };
