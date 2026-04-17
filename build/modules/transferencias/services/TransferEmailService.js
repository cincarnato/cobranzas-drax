import { AbstractService } from "@drax/crud-back";
class TransferEmailService extends AbstractService {
    constructor(TransferEmailRepository, baseSchema, fullSchema) {
        super(TransferEmailRepository, baseSchema, fullSchema);
        this._validateOutput = true;
    }
}
export default TransferEmailService;
export { TransferEmailService };
