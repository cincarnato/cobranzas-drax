import AffiliateTypeServiceFactory from "../factory/services/AffiliateTypeServiceFactory.js";
import { AbstractFastifyController } from "@drax/crud-back";
import AffiliateTypePermissions from "../permissions/AffiliateTypePermissions.js";
class AffiliateTypeController extends AbstractFastifyController {
    constructor() {
        super(AffiliateTypeServiceFactory.instance, AffiliateTypePermissions);
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
export { AffiliateTypeController };
