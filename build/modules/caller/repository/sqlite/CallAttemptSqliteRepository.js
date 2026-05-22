import { AbstractSqliteRepository } from "@drax/crud-back";
class CallAttemptSqliteRepository extends AbstractSqliteRepository {
    constructor() {
        super(...arguments);
        this.tableName = 'CallAttempt';
        this.searchFields = ['result', 'callListName', 'callLogId'];
        this.booleanFields = [];
        this.identifier = '_id';
        this.populateFields = [
            { field: 'user', table: 'user', identifier: '_id' },
            { field: 'callLog', table: 'CallLog', identifier: '_id' }
        ];
        this.verbose = false;
        this.tableFields = [
            { name: "date", type: "TEXT", unique: undefined, primary: false },
            { name: "user", type: "TEXT", unique: undefined, primary: false },
            { name: "result", type: "TEXT", unique: undefined, primary: false },
            { name: "callListName", type: "TEXT", unique: undefined, primary: false },
            { name: "callLogId", type: "TEXT", unique: undefined, primary: false },
            { name: "callLog", type: "TEXT", unique: undefined, primary: false }
        ];
    }
}
export default CallAttemptSqliteRepository;
export { CallAttemptSqliteRepository };
