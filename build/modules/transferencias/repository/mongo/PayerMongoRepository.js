import { AbstractMongoRepository } from "@drax/crud-back";
import { PayerModel } from "../../models/PayerModel.js";
class PayerMongoRepository extends AbstractMongoRepository {
    constructor() {
        super();
        this._model = PayerModel;
        this._searchFields = ['strategy', 'value', 'affiliateName', 'affiliateEmail', 'affiliateDocumentNumber', 'additionalAffiliates.name', 'additionalAffiliates.email', 'additionalAffiliates.documentNumber'];
        this._populateFields = [];
        this._lean = true;
    }
    async findByAnyStrategy(criteria) {
        if (criteria.length === 0) {
            return [];
        }
        return await this._model.find({
            $or: criteria.map((item) => ({
                strategy: item.strategy,
                value: item.value,
            })),
        }).lean();
    }
}
export default PayerMongoRepository;
export { PayerMongoRepository };
