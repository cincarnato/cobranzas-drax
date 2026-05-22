import { AbstractMongoRepository } from "@drax/crud-back";
import { CallAttemptModel } from "../../models/CallAttemptModel.js";
class CallAttemptMongoRepository extends AbstractMongoRepository {
    constructor() {
        super();
        this._model = CallAttemptModel;
        this._searchFields = ['result', 'callListName', 'callLogId'];
        this._populateFields = ['user', 'callLog'];
        this._lean = true;
    }
}
export default CallAttemptMongoRepository;
export { CallAttemptMongoRepository };
