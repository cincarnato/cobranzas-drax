import { AbstractMongoRepository } from "@drax/crud-back";
import { BonusModel } from "../../models/BonusModel.js";
class BonusMongoRepository extends AbstractMongoRepository {
    constructor() {
        super();
        this._model = BonusModel;
        this._searchFields = ['dni', 'fullname', 'plan'];
        this._populateFields = ['createdBy'];
        this._lean = true;
    }
}
export default BonusMongoRepository;
export { BonusMongoRepository };
