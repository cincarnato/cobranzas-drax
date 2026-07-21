
import {AbstractMongoRepository} from "@drax/crud-back";
import {TypificationEmailModel} from "../../models/TypificationEmailModel.js";
import type {ITypificationEmailRepository} from '../../interfaces/ITypificationEmailRepository'
import type {ITypificationEmail, ITypificationEmailBase} from "../../interfaces/ITypificationEmail";


class TypificationEmailMongoRepository extends AbstractMongoRepository<ITypificationEmail, ITypificationEmailBase, ITypificationEmailBase> implements ITypificationEmailRepository {

    constructor() {
        super();
        this._model = TypificationEmailModel;
        this._searchFields = ['name', 'description'];
        this._populateFields = [];
        this._lean = true
    }

}

export default TypificationEmailMongoRepository
export {TypificationEmailMongoRepository}

