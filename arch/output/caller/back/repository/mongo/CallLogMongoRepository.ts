
import {AbstractMongoRepository} from "@drax/crud-back";
import {CallLogModel} from "../../models/CallLogModel.js";
import type {ICallLogRepository} from '../../interfaces/ICallLogRepository'
import type {ICallLog, ICallLogBase} from "../../interfaces/ICallLog";


class CallLogMongoRepository extends AbstractMongoRepository<ICallLog, ICallLogBase, ICallLogBase> implements ICallLogRepository {

    constructor() {
        super();
        this._model = CallLogModel;
        this._searchFields = ['typification'];
        this._populateFields = ['callList'];
        this._lean = true
    }

}

export default CallLogMongoRepository
export {CallLogMongoRepository}

