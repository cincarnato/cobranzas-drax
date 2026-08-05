
import {AbstractMongoRepository} from "@drax/crud-back";
import {TemplateEmailModel} from "../../models/TemplateEmailModel.js";
import type {ITemplateEmailRepository} from '../../interfaces/ITemplateEmailRepository'
import type {ITemplateEmail, ITemplateEmailBase} from "../../interfaces/ITemplateEmail";


class TemplateEmailMongoRepository extends AbstractMongoRepository<ITemplateEmail, ITemplateEmailBase, ITemplateEmailBase> implements ITemplateEmailRepository {

    constructor() {
        super();
        this._model = TemplateEmailModel;
        this._searchFields = ['name', 'content'];
        this._populateFields = ['mailbox'];
        this._lean = true
    }

}

export default TemplateEmailMongoRepository
export {TemplateEmailMongoRepository}

