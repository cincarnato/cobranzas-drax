
import type{IAffiliateTypeRepository} from "../interfaces/IAffiliateTypeRepository";
import type {IAffiliateTypeBase, IAffiliateType} from "../interfaces/IAffiliateType";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class AffiliateTypeService extends AbstractService<IAffiliateType, IAffiliateTypeBase, IAffiliateTypeBase> {


    constructor(AffiliateTypeRepository: IAffiliateTypeRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(AffiliateTypeRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default AffiliateTypeService
export {AffiliateTypeService}
