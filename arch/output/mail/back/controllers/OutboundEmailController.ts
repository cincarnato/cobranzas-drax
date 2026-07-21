
import OutboundEmailServiceFactory from "../factory/services/OutboundEmailServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import OutboundEmailPermissions from "../permissions/OutboundEmailPermissions.js";
import type {IOutboundEmail, IOutboundEmailBase} from "../interfaces/IOutboundEmail";

class OutboundEmailController extends AbstractFastifyController<IOutboundEmail, IOutboundEmailBase, IOutboundEmailBase>   {

    constructor() {
        super(OutboundEmailServiceFactory.instance, OutboundEmailPermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        
        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;
        
        this.userFilter = true;
        this.userSetter = true;
        this.userAssert = true;
    }

}

export default OutboundEmailController;
export {
    OutboundEmailController
}

