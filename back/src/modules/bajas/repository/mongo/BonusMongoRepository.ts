
import {AbstractMongoRepository} from "@drax/crud-back";
import {BonusModel} from "../../models/BonusModel.js";
import type {IBonusRepository} from '../../interfaces/IBonusRepository'
import type {IBonus, IBonusBase} from "../../interfaces/IBonus";


class BonusMongoRepository extends AbstractMongoRepository<IBonus, IBonusBase, IBonusBase> implements IBonusRepository {

    constructor() {
        super();
        this._model = BonusModel;
        this._searchFields = ['dni', 'fullname', 'plan'];
        this._populateFields = ['createdBy'];
        this._lean = true
    }

}

export default BonusMongoRepository
export {BonusMongoRepository}

