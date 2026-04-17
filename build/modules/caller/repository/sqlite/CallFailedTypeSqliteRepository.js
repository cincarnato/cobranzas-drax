import { AbstractSqliteRepository } from "@drax/crud-back";
class CallFailedTypeSqliteRepository extends AbstractSqliteRepository {
    constructor() {
        super(...arguments);
        this.tableName = 'CallFailedType';
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
export default CallFailedTypeSqliteRepository;
export { CallFailedTypeSqliteRepository };
