
import {AbstractMongoRepository} from "@drax/crud-back";
import {TransferEmailModel} from "../../models/TransferEmailModel.js";
import type {ITransferEmailRepository} from '../../interfaces/ITransferEmailRepository'
import type {ITransferEmail, ITransferEmailBase} from "../../interfaces/ITransferEmail";


class TransferEmailMongoRepository extends AbstractMongoRepository<ITransferEmail, ITransferEmailBase, ITransferEmailBase> implements ITransferEmailRepository {

    constructor() {
        super();
        this._model = TransferEmailModel;
        this._searchFields = ['affiliateName', 'affiliateEmail', 'affiliateDocumentNumber'];
        this._populateFields = ['inboundEmail'];
        this._lean = true
    }

}

export default TransferEmailMongoRepository
export {TransferEmailMongoRepository}

