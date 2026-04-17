import { AbstractMongoRepository } from "@drax/crud-back";
import { GroupZoneModel } from "../../models/GroupZoneModel.js";
class GroupZoneMongoRepository extends AbstractMongoRepository {
    constructor() {
        super();
        this._model = GroupZoneModel;
        this._searchFields = ['name'];
        this._populateFields = ['users'];
        this._lean = true;
    }
}
export default GroupZoneMongoRepository;
export { GroupZoneMongoRepository };
