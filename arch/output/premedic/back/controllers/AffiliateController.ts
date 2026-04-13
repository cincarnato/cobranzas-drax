
import AffiliateServiceFactory from "../factory/services/AffiliateServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import AffiliatePermissions from "../permissions/AffiliatePermissions.js";
import type {IAffiliate, IAffiliateBase} from "../interfaces/IAffiliate";

class AffiliateController extends AbstractFastifyController<IAffiliate, IAffiliateBase, IAffiliateBase>   {

    constructor() {
        super(AffiliateServiceFactory.instance, AffiliatePermissions)
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

export default AffiliateController;
export {
    AffiliateController
}

