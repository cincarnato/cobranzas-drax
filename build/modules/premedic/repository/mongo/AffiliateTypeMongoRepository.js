import { AbstractMongoRepository } from "@drax/crud-back";
import { AffiliateTypeModel } from "../../models/AffiliateTypeModel.js";
class AffiliateTypeMongoRepository extends AbstractMongoRepository {
    constructor() {
        super();
        this._model = AffiliateTypeModel;
        this._searchFields = ['nombre'];
        this._populateFields = [];
        this._lean = true;
    }
}
export default AffiliateTypeMongoRepository;
export { AffiliateTypeMongoRepository };
