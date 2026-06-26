import { AbstractMongoRepository } from "@drax/crud-back";
import { PadronModel } from "../../models/PadronModel.js";
class PadronMongoRepository extends AbstractMongoRepository {
    constructor() {
        super();
        this._model = PadronModel;
        this._searchFields = ['contra', 'ape_nom', 'domicilio', 'loca', 'nro_ref_elect', 'celular', 'deno_provin', 'alias', 'cbu_siro'];
        this._populateFields = [];
        this._lean = true;
    }
    async deleteAll() {
        await this._model.deleteMany({}).exec();
        return true;
    }
}
export default PadronMongoRepository;
export { PadronMongoRepository };
