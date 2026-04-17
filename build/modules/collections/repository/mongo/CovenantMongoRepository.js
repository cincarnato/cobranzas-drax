import { AbstractMongoRepository } from "@drax/crud-back";
import { CovenantModel } from "../../models/CovenantModel.js";
class CovenantMongoRepository extends AbstractMongoRepository {
    constructor() {
        super();
        this._model = CovenantModel;
        this._searchFields = ['fullname', 'dni'];
        this._populateFields = ['group', 'createdBy', 'updatedBy', 'refuseBy'];
        this._lean = true;
    }
}
export default CovenantMongoRepository;
export { CovenantMongoRepository };
