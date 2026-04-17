import AffiliateServiceFactory from "../factory/services/AffiliateServiceFactory.js";
import { AbstractFastifyController } from "@drax/crud-back";
import AffiliatePermissions from "../permissions/AffiliatePermissions.js";
class AffiliateController extends AbstractFastifyController {
    constructor() {
        super(AffiliateServiceFactory.instance, AffiliatePermissions);
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
export { AffiliateController };
