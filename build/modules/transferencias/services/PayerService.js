import { AbstractService } from "@drax/crud-back";
class PayerService extends AbstractService {
    constructor(PayerRepository, baseSchema, fullSchema) {
        super(PayerRepository, baseSchema, fullSchema);
        this.payerRepository = PayerRepository;
        this._validateOutput = true;
    }
    async findByAnyStrategy(criteria) {
        return this.payerRepository.findByAnyStrategy(criteria);
    }
}
export default PayerService;
export { PayerService };
