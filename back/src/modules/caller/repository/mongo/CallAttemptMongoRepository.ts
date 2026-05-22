import {AbstractMongoRepository} from "@drax/crud-back";
import {CallAttemptModel} from "../../models/CallAttemptModel.js";
import type {ICallAttemptRepository} from '../../interfaces/ICallAttemptRepository'
import type {ICallAttempt, ICallAttemptBase} from "../../interfaces/ICallAttempt";

class CallAttemptMongoRepository extends AbstractMongoRepository<ICallAttempt, ICallAttemptBase, ICallAttemptBase> implements ICallAttemptRepository {

    constructor() {
        super();
        this._model = CallAttemptModel;
        this._searchFields = ['result', 'callListName', 'callLogId'];
        this._populateFields = ['user', 'callLog'];
        this._lean = true
    }

}

export default CallAttemptMongoRepository
export {CallAttemptMongoRepository}
