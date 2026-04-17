
import {AbstractMongoRepository} from "@drax/crud-back";
import {AffiliateTypeModel} from "../../models/AffiliateTypeModel.js";
import type {IAffiliateTypeRepository} from '../../interfaces/IAffiliateTypeRepository'
import type {IAffiliateType, IAffiliateTypeBase} from "../../interfaces/IAffiliateType";


class AffiliateTypeMongoRepository extends AbstractMongoRepository<IAffiliateType, IAffiliateTypeBase, IAffiliateTypeBase> implements IAffiliateTypeRepository {

    constructor() {
        super();
        this._model = AffiliateTypeModel;
        this._searchFields = ['nombre'];
        this._populateFields = [];
        this._lean = true
    }

}

export default AffiliateTypeMongoRepository
export {AffiliateTypeMongoRepository}

