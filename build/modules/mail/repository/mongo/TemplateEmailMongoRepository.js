import { AbstractMongoRepository } from "@drax/crud-back";
import { TemplateEmailModel } from "../../models/TemplateEmailModel.js";
class TemplateEmailMongoRepository extends AbstractMongoRepository {
    constructor() {
        super();
        this._model = TemplateEmailModel;
        this._searchFields = ['name', 'content'];
        this._populateFields = ['mailbox'];
        this._lean = true;
    }
}
export default TemplateEmailMongoRepository;
export { TemplateEmailMongoRepository };
