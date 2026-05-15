import { AbstractService } from "@drax/crud-back";
class WhatsappMessageService extends AbstractService {
    constructor(WhatsappMessageRepository, baseSchema, fullSchema) {
        super(WhatsappMessageRepository, baseSchema, fullSchema);
        this._validateOutput = true;
    }
}
export default WhatsappMessageService;
export { WhatsappMessageService };
