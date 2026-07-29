import { AbstractSqliteRepository } from "@drax/crud-back";
class InternalTransferBonusSqliteRepository extends AbstractSqliteRepository {
    constructor() {
        super(...arguments);
        this.tableName = 'InternalTransferBonus';
        this.searchFields = ['dni', 'fullname'];
        this.booleanFields = [];
        this.jsonFields = ['bankDataAttachment'];
        this.identifier = '_id';
        this.populateFields = [
            { field: 'createdBy', table: 'createdBy', identifier: '_id' }
        ];
        this.verbose = false;
        this.tableFields = [
            { name: "dni", type: "TEXT", unique: undefined, primary: false },
            { name: "fullname", type: "TEXT", unique: undefined, primary: false },
            { name: "appliedMonth", type: "TEXT", unique: undefined, primary: false },
            { name: "bonifiedValue", type: "REAL", unique: undefined, primary: false },
            { name: "bonusType", type: "TEXT", unique: undefined, primary: false },
            { name: "bankDataAttachment", type: "TEXT", unique: undefined, primary: false },
            { name: "status", type: "TEXT", unique: undefined, primary: false },
            { name: "observation", type: "TEXT", unique: undefined, primary: false },
            { name: "createdBy", type: "TEXT", unique: undefined, primary: false }
        ];
    }
}
export default InternalTransferBonusSqliteRepository;
export { InternalTransferBonusSqliteRepository };
