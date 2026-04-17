import { AbstractService } from "@drax/crud-back";
class PayerEntityService extends AbstractService {
    constructor(PayerEntityRepository, baseSchema, fullSchema) {
        super(PayerEntityRepository, baseSchema, fullSchema);
        this._validateOutput = true;
    }
}
export default PayerEntityService;
export { PayerEntityService };
