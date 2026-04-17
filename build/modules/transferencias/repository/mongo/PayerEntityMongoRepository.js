import { AbstractMongoRepository } from "@drax/crud-back";
import { PayerEntityModel } from "../../models/PayerEntityModel.js";
class PayerEntityMongoRepository extends AbstractMongoRepository {
    constructor() {
        super();
        this._model = PayerEntityModel;
        this._searchFields = ['cuilCuit', 'nombre'];
        this._populateFields = [];
        this._lean = true;
    }
}
export default PayerEntityMongoRepository;
export { PayerEntityMongoRepository };
