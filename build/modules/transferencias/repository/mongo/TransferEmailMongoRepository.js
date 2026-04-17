import { AbstractMongoRepository } from "@drax/crud-back";
import { TransferEmailModel } from "../../models/TransferEmailModel.js";
class TransferEmailMongoRepository extends AbstractMongoRepository {
    constructor() {
        super();
        this._model = TransferEmailModel;
        this._searchFields = ['affiliateName', 'affiliateEmail', 'affiliateDocumentNumber'];
        this._populateFields = ['inboundEmail'];
        this._lean = true;
    }
}
export default TransferEmailMongoRepository;
export { TransferEmailMongoRepository };
