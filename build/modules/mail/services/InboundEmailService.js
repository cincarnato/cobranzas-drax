import { AbstractService } from "@drax/crud-back";
class InboundEmailService extends AbstractService {
    constructor(InboundEmailRepository, baseSchema, fullSchema) {
        super(InboundEmailRepository, baseSchema, fullSchema);
        this._validateOutput = true;
    }
}
export default InboundEmailService;
export { InboundEmailService };
