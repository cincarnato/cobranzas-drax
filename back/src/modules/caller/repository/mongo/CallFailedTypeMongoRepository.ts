
import {AbstractMongoRepository} from "@drax/crud-back";
import {CallFailedTypeModel} from "../../models/CallFailedTypeModel.js";
import type {ICallFailedTypeRepository} from '../../interfaces/ICallFailedTypeRepository'
import type {ICallFailedType, ICallFailedTypeBase} from "../../interfaces/ICallFailedType";


class CallFailedTypeMongoRepository extends AbstractMongoRepository<ICallFailedType, ICallFailedTypeBase, ICallFailedTypeBase> implements ICallFailedTypeRepository {

    constructor() {
        super();
        this._model = CallFailedTypeModel;
        this._searchFields = ['name'];
        this._populateFields = [];
        this._lean = true
    }

}

export default CallFailedTypeMongoRepository
export {CallFailedTypeMongoRepository}

