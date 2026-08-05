import { AbstractSqliteRepository } from "@drax/crud-back";
class TemplateEmailSqliteRepository extends AbstractSqliteRepository {
    constructor() {
        super(...arguments);
        this.tableName = 'TemplateEmail';
        this.searchFields = ['name', 'content'];
        this.booleanFields = [];
        this.jsonFields = [];
        this.identifier = 'name';
        this.populateFields = [
            { field: 'mailbox', table: 'mailbox', identifier: '_id' }
        ];
        this.verbose = false;
        this.tableFields = [
            { name: "mailbox", type: "TEXT", unique: undefined, primary: false },
            { name: "name", type: "TEXT", unique: undefined, primary: false },
            { name: "content", type: "TEXT", unique: undefined, primary: false }
        ];
    }
}
export default TemplateEmailSqliteRepository;
export { TemplateEmailSqliteRepository };
