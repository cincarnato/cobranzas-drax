
import {AbstractMongoRepository} from "@drax/crud-back";
import {AffiliateModel} from "../../models/AffiliateModel.js";
import type {IAffiliateRepository} from '../../interfaces/IAffiliateRepository'
import type {IAffiliate, IAffiliateBase} from "../../interfaces/IAffiliate";


class AffiliateMongoRepository extends AbstractMongoRepository<IAffiliate, IAffiliateBase, IAffiliateBase> implements IAffiliateRepository {

    constructor() {
        super();
        this._model = AffiliateModel;
        this._searchFields = ['apellidoNombre', 'dni', 'cuilCuit', 'tipo', 'titular', 'titularDni'];
        this._populateFields = ['titular'];
        this._lean = true
    }

}

export default AffiliateMongoRepository
export {AffiliateMongoRepository}

