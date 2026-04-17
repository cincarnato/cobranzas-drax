import { AbstractSqliteRepository } from "@drax/crud-back";
class AffiliateTypeSqliteRepository extends AbstractSqliteRepository {
    constructor() {
        super(...arguments);
        this.tableName = 'AffiliateType';
        this.searchFields = ['nombre'];
        this.booleanFields = [];
        this.jsonFields = [];
        this.identifier = '_id';
        this.populateFields = [];
        this.verbose = false;
        this.tableFields = [
            { name: "nombre", type: "TEXT", unique: undefined, primary: false },
            { name: "descripcion", type: "TEXT", unique: undefined, primary: false }
        ];
    }
}
export default AffiliateTypeSqliteRepository;
export { AffiliateTypeSqliteRepository };
