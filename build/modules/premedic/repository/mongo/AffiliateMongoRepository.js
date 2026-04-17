import { AbstractMongoRepository } from "@drax/crud-back";
import { AffiliateModel } from "../../models/AffiliateModel.js";
class AffiliateMongoRepository extends AbstractMongoRepository {
    constructor() {
        super();
        this._model = AffiliateModel;
        this._searchFields = ['apellidoNombre', 'dni', 'cuilCuit', 'tipo', 'titularDni'];
        this._populateFields = ['titular'];
        this._lean = true;
    }
}
export default AffiliateMongoRepository;
export { AffiliateMongoRepository };
