import { AbstractService } from "@drax/crud-back";
class AffiliateService extends AbstractService {
    constructor(AffiliateRepository, baseSchema, fullSchema) {
        super(AffiliateRepository, baseSchema, fullSchema);
        this._validateOutput = true;
    }
}
export default AffiliateService;
export { AffiliateService };
