
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IInternalTransferBonusRepository} from '../../interfaces/IInternalTransferBonusRepository'
import type {IInternalTransferBonus, IInternalTransferBonusBase} from "../../interfaces/IInternalTransferBonus";
import {SqliteTableField} from "@drax/common-back";

class InternalTransferBonusSqliteRepository extends AbstractSqliteRepository<IInternalTransferBonus, IInternalTransferBonusBase, IInternalTransferBonusBase> implements IInternalTransferBonusRepository {

    protected db: any;
    protected tableName: string = 'InternalTransferBonus';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['dni', 'fullname'];
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
{name: "appliedMonth", type: "TEXT", unique: undefined, primary: false},
{name: "bonifiedValue", type: "FLOAT", unique: undefined, primary: false},
{name: "bonifiedValue", type: "TEXT", unique: undefined, primary: false},
{name: "bonusType", type: "TEXT", unique: undefined, primary: false},
{name: "bankDataAttachment", type: "TEXT", unique: undefined, primary: false},
{name: "status", type: "TEXT", unique: undefined, primary: false},
{name: "observation", type: "TEXT", unique: undefined, primary: false},
{name: "createdBy", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default InternalTransferBonusSqliteRepository
export {InternalTransferBonusSqliteRepository}

