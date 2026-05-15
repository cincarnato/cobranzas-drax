import { AbstractSqliteRepository } from "@drax/crud-back";
class WhatsappMessageSqliteRepository extends AbstractSqliteRepository {
    constructor() {
        super(...arguments);
        this.tableName = 'WhatsappMessage';
        this.searchFields = ['destinationNumber', 'template'];
        this.booleanFields = [];
        this.jsonFields = [];
        this.identifier = '_id';
        this.populateFields = [
            { field: 'user', table: 'user', identifier: '_id' }
        ];
        this.verbose = false;
        this.tableFields = [
            { name: "sentAt", type: "TEXT", unique: undefined, primary: false },
            { name: "user", type: "TEXT", unique: undefined, primary: false },
            { name: "destinationNumber", type: "TEXT", unique: undefined, primary: false },
            { name: "template", type: "TEXT", unique: undefined, primary: false }
        ];
    }
}
export default WhatsappMessageSqliteRepository;
export { WhatsappMessageSqliteRepository };
