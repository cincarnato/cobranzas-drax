import { AbstractService } from "@drax/crud-back";
class CallFailedTypeService extends AbstractService {
    constructor(CallFailedTypeRepository, baseSchema, fullSchema) {
        super(CallFailedTypeRepository, baseSchema, fullSchema);
        this._validateOutput = true;
    }
}
export default CallFailedTypeService;
export { CallFailedTypeService };
