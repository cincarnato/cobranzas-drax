import InboundEmailServiceFactory from "../factory/services/InboundEmailServiceFactory.js";
import { AbstractFastifyController } from "@drax/crud-back";
import InboundEmailPermissions from "../permissions/InboundEmailPermissions.js";
class InboundEmailController extends AbstractFastifyController {
    constructor() {
        super(InboundEmailServiceFactory.instance, InboundEmailPermissions);
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
export default InboundEmailController;
export { InboundEmailController };
