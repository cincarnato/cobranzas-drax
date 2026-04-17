import { AbstractSqliteRepository } from "@drax/crud-back";
class CallSuccessTypeSqliteRepository extends AbstractSqliteRepository {
    constructor() {
        super(...arguments);
        this.tableName = 'CallSuccessType';
        this.searchFields = ['name'];
        this.booleanFields = [];
        this.identifier = '_id';
        this.populateFields = [];
        this.verbose = false;
        this.tableFields = [
            { name: "name", type: "TEXT", unique: undefined, primary: false },
            { name: "color", type: "TEXT", unique: undefined, primary: false }
        ];
    }
}
export default CallSuccessTypeSqliteRepository;
export { CallSuccessTypeSqliteRepository };
