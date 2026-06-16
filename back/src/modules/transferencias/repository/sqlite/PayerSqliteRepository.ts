
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IPayerRepository} from '../../interfaces/IPayerRepository'
import type {IPayer, IPayerBase, IPayerLookupCriteria} from "../../interfaces/IPayer";
import {SqliteTableField} from "@drax/common-back";

class PayerSqliteRepository extends AbstractSqliteRepository<IPayer, IPayerBase, IPayerBase> implements IPayerRepository {

    protected db: any;
    protected tableName: string = 'Payer';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['strategy', 'value', 'affiliates'];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = ['affiliates'];
    protected identifier: string = '_id';
    protected populateFields = [
        
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
{name: "strategy", type: "TEXT", unique: undefined, primary: false},
{name: "value", type: "TEXT", unique: undefined, primary: false},
{name: "affiliates", type: "TEXT", unique: undefined, primary: false}
    ]

    async findByAnyStrategy(criteria: IPayerLookupCriteria[]): Promise<IPayer[]> {
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

export default PayerSqliteRepository
export {PayerSqliteRepository}
