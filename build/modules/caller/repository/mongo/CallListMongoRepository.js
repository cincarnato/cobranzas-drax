import { AbstractMongoRepository } from "@drax/crud-back";
import { CallListModel } from "../../models/CallListModel.js";
class CallListMongoRepository extends AbstractMongoRepository {
    constructor() {
        super();
        this._model = CallListModel;
        this._searchFields = ['name'];
        this._populateFields = ['group', 'user'];
        this._lean = true;
    }
}
export default CallListMongoRepository;
export { CallListMongoRepository };
