import { AbstractService } from "@drax/crud-back";
class PadronService extends AbstractService {
    constructor(PadronRepository, baseSchema, fullSchema) {
        super(PadronRepository, baseSchema, fullSchema);
        this._validateOutput = true;
    }
}
export default PadronService;
export { PadronService };
