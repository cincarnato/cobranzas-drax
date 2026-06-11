import { AbstractSqliteRepository } from "@drax/crud-back";
class PayerSqliteRepository extends AbstractSqliteRepository {
    constructor() {
        super(...arguments);
        this.tableName = 'Payer';
        this.searchFields = ['strategy', 'value', 'affiliateName', 'affiliateEmail', 'affiliateDocumentNumber'];
        this.booleanFields = [];
        this.jsonFields = ['additionalAffiliates'];
        this.identifier = '_id';
        this.populateFields = [];
        this.verbose = false;
        this.tableFields = [
            { name: "strategy", type: "TEXT", unique: undefined, primary: false },
            { name: "value", type: "TEXT", unique: undefined, primary: false },
            { name: "affiliateName", type: "TEXT", unique: undefined, primary: false },
            { name: "affiliateEmail", type: "TEXT", unique: undefined, primary: false },
            { name: "affiliateDocumentNumber", type: "TEXT", unique: undefined, primary: false },
            { name: "additionalAffiliates", type: "TEXT", unique: undefined, primary: false }
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
