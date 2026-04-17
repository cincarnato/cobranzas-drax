import { AbstractMongoRepository } from "@drax/crud-back";
import { CallSuccessTypeModel } from "../../models/CallSuccessTypeModel.js";
class CallSuccessTypeMongoRepository extends AbstractMongoRepository {
    constructor() {
        super();
        this._model = CallSuccessTypeModel;
        this._searchFields = ['name'];
        this._populateFields = [];
        this._lean = true;
    }
}
export default CallSuccessTypeMongoRepository;
export { CallSuccessTypeMongoRepository };
