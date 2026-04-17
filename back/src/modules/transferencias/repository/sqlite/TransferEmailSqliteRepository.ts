
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {ITransferEmailRepository} from '../../interfaces/ITransferEmailRepository'
import type {ITransferEmail, ITransferEmailBase} from "../../interfaces/ITransferEmail";
import {SqliteTableField} from "@drax/common-back";

class TransferEmailSqliteRepository extends AbstractSqliteRepository<ITransferEmail, ITransferEmailBase, ITransferEmailBase> implements ITransferEmailRepository {

    protected db: any;
    protected tableName: string = 'TransferEmail';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['affiliateName', 'affiliateEmail', 'affiliateDocumentNumber'];
    protected booleanFields: string[] = ['isTransferProof', 'needsHumanReview'];
    protected jsonFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'inboundEmail', table: 'inboundEmail', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "inboundEmail", type: "TEXT", unique: undefined, primary: false},
{name: "isTransferProof", type: "TEXT", unique: undefined, primary: false},
{name: "amount", type: "REAL", unique: undefined, primary: false},
{name: "amount", type: "TEXT", unique: undefined, primary: false},
{name: "currency", type: "TEXT", unique: undefined, primary: false},
{name: "transferDate", type: "TEXT", unique: undefined, primary: false},
{name: "operationNumber", type: "TEXT", unique: undefined, primary: false},
{name: "concept", type: "TEXT", unique: undefined, primary: false},
{name: "originAccount", type: "TEXT", unique: undefined, primary: false},
{name: "originCbu", type: "TEXT", unique: undefined, primary: false},
{name: "originAlias", type: "TEXT", unique: undefined, primary: false},
{name: "originBank", type: "TEXT", unique: undefined, primary: false},
{name: "destinationAccount", type: "TEXT", unique: undefined, primary: false},
{name: "destinationCbu", type: "TEXT", unique: undefined, primary: false},
{name: "destinationAlias", type: "TEXT", unique: undefined, primary: false},
{name: "destinationBank", type: "TEXT", unique: undefined, primary: false},
{name: "affiliateName", type: "TEXT", unique: undefined, primary: false},
{name: "affiliateEmail", type: "TEXT", unique: undefined, primary: false},
{name: "affiliateDocumentNumber", type: "TEXT", unique: undefined, primary: false},
{name: "needsHumanReview", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default TransferEmailSqliteRepository
export {TransferEmailSqliteRepository}
