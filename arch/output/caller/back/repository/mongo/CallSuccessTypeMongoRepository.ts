
import {AbstractMongoRepository} from "@drax/crud-back";
import {CallSuccessTypeModel} from "../../models/CallSuccessTypeModel.js";
import type {ICallSuccessTypeRepository} from '../../interfaces/ICallSuccessTypeRepository'
import type {ICallSuccessType, ICallSuccessTypeBase} from "../../interfaces/ICallSuccessType";


class CallSuccessTypeMongoRepository extends AbstractMongoRepository<ICallSuccessType, ICallSuccessTypeBase, ICallSuccessTypeBase> implements ICallSuccessTypeRepository {

    constructor() {
        super();
        this._model = CallSuccessTypeModel;
        this._searchFields = ['name'];
        this._populateFields = [];
        this._lean = true
    }

}

export default CallSuccessTypeMongoRepository
export {CallSuccessTypeMongoRepository}

