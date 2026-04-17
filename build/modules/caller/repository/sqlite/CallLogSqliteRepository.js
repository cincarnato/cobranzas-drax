import { AbstractSqliteRepository } from "@drax/crud-back";
class CallLogSqliteRepository extends AbstractSqliteRepository {
    constructor() {
        super(...arguments);
        this.tableName = 'CallLog';
        this.searchFields = ['typification'];
        this.booleanFields = ['done'];
        this.identifier = '_id';
        this.populateFields = [
            { field: 'callList', table: 'callList', identifier: '_id' }
        ];
        this.verbose = false;
        this.tableFields = [
            { name: "callList", type: "TEXT", unique: undefined, primary: false },
            { name: "attempts", type: "NUMERIC", unique: undefined, primary: false },
            { name: "attempts", type: "TEXT", unique: undefined, primary: false },
            { name: "notes", type: "TEXT", unique: undefined, primary: false },
            { name: "typification", type: "TEXT", unique: undefined, primary: false },
            { name: "state", type: "TEXT", unique: undefined, primary: false },
            { name: "promiseDate", type: "TEXT", unique: undefined, primary: false },
            { name: "done", type: "TEXT", unique: undefined, primary: false },
            { name: "data", type: "TEXT", unique: undefined, primary: false }
        ];
    }
}
export default CallLogSqliteRepository;
export { CallLogSqliteRepository };
