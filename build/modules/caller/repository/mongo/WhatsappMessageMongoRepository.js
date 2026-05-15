import { AbstractMongoRepository } from "@drax/crud-back";
import { WhatsappMessageModel } from "../../models/WhatsappMessageModel.js";
class WhatsappMessageMongoRepository extends AbstractMongoRepository {
    constructor() {
        super();
        this._model = WhatsappMessageModel;
        this._searchFields = ['destinationNumber', 'template'];
        this._populateFields = ['user'];
        this._lean = true;
    }
}
export default WhatsappMessageMongoRepository;
export { WhatsappMessageMongoRepository };
