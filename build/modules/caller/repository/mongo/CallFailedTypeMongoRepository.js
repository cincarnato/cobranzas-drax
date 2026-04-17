import { AbstractMongoRepository } from "@drax/crud-back";
import { CallFailedTypeModel } from "../../models/CallFailedTypeModel.js";
class CallFailedTypeMongoRepository extends AbstractMongoRepository {
    constructor() {
        super();
        this._model = CallFailedTypeModel;
        this._searchFields = ['name'];
        this._populateFields = [];
        this._lean = true;
    }
}
export default CallFailedTypeMongoRepository;
export { CallFailedTypeMongoRepository };
