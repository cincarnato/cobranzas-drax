import { AbstractService } from "@drax/crud-back";
class CallAttemptService extends AbstractService {
    constructor(CallAttemptRepository, baseSchema, fullSchema) {
        super(CallAttemptRepository, baseSchema, fullSchema);
        this._validateOutput = true;
    }
}
export default CallAttemptService;
export { CallAttemptService };
