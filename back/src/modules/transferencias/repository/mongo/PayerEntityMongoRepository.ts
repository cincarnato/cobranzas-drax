
import {AbstractMongoRepository} from "@drax/crud-back";
import {PayerEntityModel} from "../../models/PayerEntityModel.js";
import type {IPayerEntityRepository} from '../../interfaces/IPayerEntityRepository'
import type {IPayerEntity, IPayerEntityBase} from "../../interfaces/IPayerEntity";


class PayerEntityMongoRepository extends AbstractMongoRepository<IPayerEntity, IPayerEntityBase, IPayerEntityBase> implements IPayerEntityRepository {

    constructor() {
        super();
        this._model = PayerEntityModel;
        this._searchFields = ['cuilCuit', 'nombre'];
        this._populateFields = [];
        this._lean = true
    }

}

export default PayerEntityMongoRepository
export {PayerEntityMongoRepository}

