import { AbstractService } from "@drax/crud-back";
class CallSuccessTypeService extends AbstractService {
    constructor(CallSuccessTypeRepository, baseSchema, fullSchema) {
        super(CallSuccessTypeRepository, baseSchema, fullSchema);
        this._validateOutput = true;
    }
}
export default CallSuccessTypeService;
export { CallSuccessTypeService };
