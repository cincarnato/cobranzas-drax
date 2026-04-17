import { AbstractService } from "@drax/crud-back";
class BankMovementService extends AbstractService {
    constructor(BankMovementRepository, baseSchema, fullSchema) {
        super(BankMovementRepository, baseSchema, fullSchema);
        this._validateOutput = true;
    }
}
export default BankMovementService;
export { BankMovementService };
