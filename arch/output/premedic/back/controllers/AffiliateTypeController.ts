
import AffiliateTypeServiceFactory from "../factory/services/AffiliateTypeServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import AffiliateTypePermissions from "../permissions/AffiliateTypePermissions.js";
import type {IAffiliateType, IAffiliateTypeBase} from "../interfaces/IAffiliateType";

class AffiliateTypeController extends AbstractFastifyController<IAffiliateType, IAffiliateTypeBase, IAffiliateTypeBase>   {

    constructor() {
        super(AffiliateTypeServiceFactory.instance, AffiliateTypePermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        
        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;
        
        this.userFilter = false;
        this.userSetter = false;
        this.userAssert = false;
    }

}

export default AffiliateTypeController;
export {
    AffiliateTypeController
}

