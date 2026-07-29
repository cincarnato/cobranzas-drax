import { AbstractMongoRepository } from "@drax/crud-back";
import { InternalTransferBonusModel } from "../../models/InternalTransferBonusModel.js";
class InternalTransferBonusMongoRepository extends AbstractMongoRepository {
    constructor() {
        super();
        this._model = InternalTransferBonusModel;
        this._searchFields = ['dni', 'fullname'];
        this._populateFields = ['createdBy'];
        this._lean = true;
    }
}
export default InternalTransferBonusMongoRepository;
export { InternalTransferBonusMongoRepository };
