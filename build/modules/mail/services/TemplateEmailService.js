import { AbstractService } from "@drax/crud-back";
class TemplateEmailService extends AbstractService {
    constructor(TemplateEmailRepository, baseSchema, fullSchema) {
        super(TemplateEmailRepository, baseSchema, fullSchema);
        this._validateOutput = true;
    }
}
export default TemplateEmailService;
export { TemplateEmailService };
