
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {ITemplateEmailRepository} from '../../interfaces/ITemplateEmailRepository'
import type {ITemplateEmail, ITemplateEmailBase} from "../../interfaces/ITemplateEmail";
import {SqliteTableField} from "@drax/common-back";

class TemplateEmailSqliteRepository extends AbstractSqliteRepository<ITemplateEmail, ITemplateEmailBase, ITemplateEmailBase> implements ITemplateEmailRepository {

    protected db: any;
    protected tableName: string = 'TemplateEmail';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['name', 'content'];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = [];
    protected identifier: string = 'name';
    protected populateFields = [
        { field: 'mailbox', table: 'mailbox', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "mailbox", type: "TEXT", unique: undefined, primary: false},
{name: "name", type: "TEXT", unique: undefined, primary: false},
{name: "content", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default TemplateEmailSqliteRepository
export {TemplateEmailSqliteRepository}

