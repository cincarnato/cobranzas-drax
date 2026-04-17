import { AbstractService } from "@drax/crud-back";
class AffiliateTypeService extends AbstractService {
    constructor(AffiliateTypeRepository, baseSchema, fullSchema) {
        super(AffiliateTypeRepository, baseSchema, fullSchema);
        this._validateOutput = true;
    }
}
export default AffiliateTypeService;
export { AffiliateTypeService };
