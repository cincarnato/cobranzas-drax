
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IBonusRepository} from '../../interfaces/IBonusRepository'
import type {IBonus, IBonusBase} from "../../interfaces/IBonus";
import {SqliteTableField} from "@drax/common-back";

class BonusSqliteRepository extends AbstractSqliteRepository<IBonus, IBonusBase, IBonusBase> implements IBonusRepository {

    protected db: any;
    protected tableName: string = 'Bonus';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['dni', 'fullname', 'plan'];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'createdBy', table: 'createdBy', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "dni", type: "TEXT", unique: undefined, primary: false},
{name: "fullname", type: "TEXT", unique: undefined, primary: false},
{name: "plan", type: "TEXT", unique: undefined, primary: false},
{name: "appliedMonth", type: "TEXT", unique: undefined, primary: false},
{name: "paymentMethod", type: "TEXT", unique: undefined, primary: false},
{name: "bonus", type: "TEXT", unique: undefined, primary: false},
{name: "period", type: "TEXT", unique: undefined, primary: false},
{name: "bonifiedNetValue", type: "REAL", unique: undefined, primary: false},
{name: "status", type: "TEXT", unique: undefined, primary: false},
{name: "observation", type: "TEXT", unique: undefined, primary: false},
{name: "createdBy", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default BonusSqliteRepository
export {BonusSqliteRepository}
