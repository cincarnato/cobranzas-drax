
import {AbstractMongoRepository} from "@drax/crud-back";
import {WhatsappMessageModel} from "../../models/WhatsappMessageModel.js";
import type {IWhatsappMessageRepository} from '../../interfaces/IWhatsappMessageRepository'
import type {IWhatsappMessage, IWhatsappMessageBase} from "../../interfaces/IWhatsappMessage";


class WhatsappMessageMongoRepository extends AbstractMongoRepository<IWhatsappMessage, IWhatsappMessageBase, IWhatsappMessageBase> implements IWhatsappMessageRepository {

    constructor() {
        super();
        this._model = WhatsappMessageModel;
        this._searchFields = ['destinationNumber', 'template'];
        this._populateFields = ['user'];
        this._lean = true
    }

}

export default WhatsappMessageMongoRepository
export {WhatsappMessageMongoRepository}

