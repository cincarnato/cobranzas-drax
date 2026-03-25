
import {AbstractMongoRepository} from "@drax/crud-back";
import {CallListModel} from "../../models/CallListModel.js";
import type {ICallListRepository} from '../../interfaces/ICallListRepository'
import type {ICallList, ICallListBase} from "../../interfaces/ICallList";


class CallListMongoRepository extends AbstractMongoRepository<ICallList, ICallListBase, ICallListBase> implements ICallListRepository {

    constructor() {
        super();
        this._model = CallListModel;
        this._searchFields = ['name'];
        this._populateFields = ['group', 'user'];
        this._lean = true
    }

}

export default CallListMongoRepository
export {CallListMongoRepository}

