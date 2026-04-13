
import {AbstractMongoRepository} from "@drax/crud-back";
import {PadronModel} from "../../models/PadronModel.js";
import type {IPadronRepository} from '../../interfaces/IPadronRepository'
import type {IPadron, IPadronBase} from "../../interfaces/IPadron";


class PadronMongoRepository extends AbstractMongoRepository<IPadron, IPadronBase, IPadronBase> implements IPadronRepository {

    constructor() {
        super();
        this._model = PadronModel;
        this._searchFields = ['contra', 'ape_nom', 'domicilio', 'loca', 'nro_ref_elect', 'celular', 'deno_provin'];
        this._populateFields = [];
        this._lean = true
    }

}

export default PadronMongoRepository
export {PadronMongoRepository}

