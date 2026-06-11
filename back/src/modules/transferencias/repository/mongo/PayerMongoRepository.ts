
import {AbstractMongoRepository} from "@drax/crud-back";
import {PayerModel} from "../../models/PayerModel.js";
import type {IPayerRepository} from '../../interfaces/IPayerRepository'
import type {IPayer, IPayerBase, IPayerLookupCriteria} from "../../interfaces/IPayer";


class PayerMongoRepository extends AbstractMongoRepository<IPayer, IPayerBase, IPayerBase> implements IPayerRepository {

    constructor() {
        super();
        this._model = PayerModel;
        this._searchFields = ['strategy', 'value', 'affiliateName', 'affiliateEmail', 'affiliateDocumentNumber', 'additionalAffiliates.name', 'additionalAffiliates.email', 'additionalAffiliates.documentNumber'];
        this._populateFields = [];
        this._lean = true
    }

    async findByAnyStrategy(criteria: IPayerLookupCriteria[]): Promise<IPayer[]> {
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

export default PayerMongoRepository
export {PayerMongoRepository}
