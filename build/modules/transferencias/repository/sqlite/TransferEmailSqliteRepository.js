import { AbstractSqliteRepository } from "@drax/crud-back";
class TransferEmailSqliteRepository extends AbstractSqliteRepository {
    constructor() {
        super(...arguments);
        this.tableName = 'TransferEmail';
        this.searchFields = ['affiliateName', 'affiliateEmail', 'affiliateDocumentNumber'];
        this.booleanFields = ['isTransferProof', 'needsHumanReview'];
        this.jsonFields = [];
        this.identifier = '_id';
        this.populateFields = [
            { field: 'inboundEmail', table: 'inboundEmail', identifier: '_id' }
        ];
        this.verbose = false;
        this.tableFields = [
            { name: "inboundEmail", type: "TEXT", unique: undefined, primary: false },
            { name: "isTransferProof", type: "TEXT", unique: undefined, primary: false },
            { name: "amount", type: "REAL", unique: undefined, primary: false },
            { name: "amount", type: "TEXT", unique: undefined, primary: false },
            { name: "currency", type: "TEXT", unique: undefined, primary: false },
            { name: "transferDate", type: "TEXT", unique: undefined, primary: false },
            { name: "operationNumber", type: "TEXT", unique: undefined, primary: false },
            { name: "concept", type: "TEXT", unique: undefined, primary: false },
            { name: "originAccount", type: "TEXT", unique: undefined, primary: false },
            { name: "originCbu", type: "TEXT", unique: undefined, primary: false },
            { name: "originAlias", type: "TEXT", unique: undefined, primary: false },
            { name: "originBank", type: "TEXT", unique: undefined, primary: false },
            { name: "destinationAccount", type: "TEXT", unique: undefined, primary: false },
            { name: "destinationCbu", type: "TEXT", unique: undefined, primary: false },
            { name: "destinationAlias", type: "TEXT", unique: undefined, primary: false },
            { name: "destinationBank", type: "TEXT", unique: undefined, primary: false },
            { name: "affiliateName", type: "TEXT", unique: undefined, primary: false },
            { name: "affiliateEmail", type: "TEXT", unique: undefined, primary: false },
            { name: "affiliateDocumentNumber", type: "TEXT", unique: undefined, primary: false },
            { name: "needsHumanReview", type: "TEXT", unique: undefined, primary: false }
        ];
    }
}
export default TransferEmailSqliteRepository;
export { TransferEmailSqliteRepository };
