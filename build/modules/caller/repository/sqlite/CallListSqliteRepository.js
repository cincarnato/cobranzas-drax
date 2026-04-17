import { AbstractSqliteRepository } from "@drax/crud-back";
class CallListSqliteRepository extends AbstractSqliteRepository {
    constructor() {
        super(...arguments);
        this.tableName = 'CallList';
        this.searchFields = ['name'];
        this.booleanFields = [];
        this.identifier = '_id';
        this.populateFields = [
            { field: 'group', table: 'group', identifier: '_id' },
            { field: 'user', table: 'user', identifier: '_id' },
            { field: 'fileId', table: 'fileId', identifier: '_id' }
        ];
        this.verbose = false;
        this.tableFields = [
            { name: "group", type: "TEXT", unique: undefined, primary: false },
            { name: "user", type: "TEXT", unique: undefined, primary: false },
            { name: "file", type: "TEXT", unique: undefined, primary: false },
            { name: "fileId", type: "TEXT", unique: undefined, primary: false },
            { name: "state", type: "TEXT", unique: undefined, primary: false },
            { name: "total", type: "NUMERIC", unique: undefined, primary: false },
            { name: "total", type: "TEXT", unique: undefined, primary: false },
            { name: "attempts", type: "NUMERIC", unique: undefined, primary: false },
            { name: "attempts", type: "TEXT", unique: undefined, primary: false },
            { name: "attemptsControl", type: "TEXT", unique: undefined, primary: false },
            { name: "success", type: "NUMERIC", unique: undefined, primary: false },
            { name: "success", type: "TEXT", unique: undefined, primary: false },
            { name: "promises", type: "NUMERIC", unique: undefined, primary: false },
            { name: "promises", type: "TEXT", unique: undefined, primary: false },
            { name: "failed", type: "NUMERIC", unique: undefined, primary: false },
            { name: "failed", type: "TEXT", unique: undefined, primary: false },
            { name: "deadline", type: "TEXT", unique: undefined, primary: false },
            { name: "name", type: "TEXT", unique: true, primary: false },
            { name: "headers", type: "TEXT", unique: undefined, primary: false }
        ];
    }
}
export default CallListSqliteRepository;
export { CallListSqliteRepository };
