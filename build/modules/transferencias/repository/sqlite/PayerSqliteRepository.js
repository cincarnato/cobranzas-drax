import { AbstractSqliteRepository } from "@drax/crud-back";
class PayerSqliteRepository extends AbstractSqliteRepository {
    constructor() {
        super(...arguments);
        this.tableName = 'Payer';
        this.searchFields = ['strategy', 'value', 'affiliates'];
        this.booleanFields = [];
        this.jsonFields = ['affiliates'];
        this.identifier = '_id';
        this.populateFields = [];
        this.verbose = false;
        this.tableFields = [
            { name: "strategy", type: "TEXT", unique: undefined, primary: false },
            { name: "value", type: "TEXT", unique: undefined, primary: false },
            { name: "affiliates", type: "TEXT", unique: undefined, primary: false }
        ];
    }
    async findByAnyStrategy(criteria) {
        if (criteria.length === 0) {
            return [];
        }
        const where = criteria.map(() => "(strategy = ? AND value = ?)").join(" OR ");
        const params = criteria.flatMap((item) => [item.strategy, item.value]);
        return this.db
            .prepare(`SELECT * FROM ${this.tableName} WHERE ${where}`)
            .all(...params);
    }
}
export default PayerSqliteRepository;
export { PayerSqliteRepository };
