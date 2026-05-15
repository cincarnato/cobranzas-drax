
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IWhatsappMessageRepository} from '../../interfaces/IWhatsappMessageRepository'
import type {IWhatsappMessage, IWhatsappMessageBase} from "../../interfaces/IWhatsappMessage";
import {SqliteTableField} from "@drax/common-back";

class WhatsappMessageSqliteRepository extends AbstractSqliteRepository<IWhatsappMessage, IWhatsappMessageBase, IWhatsappMessageBase> implements IWhatsappMessageRepository {

    protected db: any;
    protected tableName: string = 'WhatsappMessage';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['destinationNumber', 'template'];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'user', table: 'user', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "sentAt", type: "TEXT", unique: undefined, primary: false},
{name: "user", type: "TEXT", unique: undefined, primary: false},
{name: "destinationNumber", type: "TEXT", unique: undefined, primary: false},
{name: "template", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default WhatsappMessageSqliteRepository
export {WhatsappMessageSqliteRepository}

