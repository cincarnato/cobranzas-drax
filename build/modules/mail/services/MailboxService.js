import { AbstractService } from "@drax/crud-back";
class MailboxService extends AbstractService {
    constructor(MailboxRepository, baseSchema, fullSchema) {
        super(MailboxRepository, baseSchema, fullSchema);
        this._validateOutput = true;
    }
}
export default MailboxService;
export { MailboxService };
