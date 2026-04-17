
import type{IAffiliateRepository} from "../interfaces/IAffiliateRepository";
import type {IAffiliateBase, IAffiliate} from "../interfaces/IAffiliate";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class AffiliateService extends AbstractService<IAffiliate, IAffiliateBase, IAffiliateBase> {


    constructor(AffiliateRepository: IAffiliateRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(AffiliateRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default AffiliateService
export {AffiliateService}
