
import {AbstractMongoRepository} from "@drax/crud-back";
import {InternalTransferBonusModel} from "../../models/InternalTransferBonusModel.js";
import type {IInternalTransferBonusRepository} from '../../interfaces/IInternalTransferBonusRepository'
import type {IInternalTransferBonus, IInternalTransferBonusBase} from "../../interfaces/IInternalTransferBonus";


class InternalTransferBonusMongoRepository extends AbstractMongoRepository<IInternalTransferBonus, IInternalTransferBonusBase, IInternalTransferBonusBase> implements IInternalTransferBonusRepository {

    constructor() {
        super();
        this._model = InternalTransferBonusModel;
        this._searchFields = ['dni', 'fullname'];
        this._populateFields = ['createdBy'];
        this._lean = true
    }

}

export default InternalTransferBonusMongoRepository
export {InternalTransferBonusMongoRepository}

