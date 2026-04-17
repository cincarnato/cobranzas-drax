import { AbstractSqliteRepository } from "@drax/crud-back";
class GroupZoneSqliteRepository extends AbstractSqliteRepository {
    constructor() {
        super(...arguments);
        this.tableName = 'GroupZone';
        this.searchFields = ['name'];
        this.booleanFields = [];
        this.identifier = '_id';
        this.populateFields = [
            { field: 'users', table: 'users', identifier: '_id' }
        ];
        this.verbose = false;
        this.tableFields = [
            { name: "name", type: "TEXT", unique: true, primary: false },
            { name: "users", type: "TEXT", unique: undefined, primary: false }
        ];
    }
}
export default GroupZoneSqliteRepository;
export { GroupZoneSqliteRepository };
