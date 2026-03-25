
import CallSuccessTypeServiceFactory from "../factory/services/CallSuccessTypeServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import CallSuccessTypePermissions from "../permissions/CallSuccessTypePermissions.js";
import type {ICallSuccessType, ICallSuccessTypeBase} from "../interfaces/ICallSuccessType";

class CallSuccessTypeController extends AbstractFastifyController<ICallSuccessType, ICallSuccessTypeBase, ICallSuccessTypeBase>   {

    constructor() {
        super(CallSuccessTypeServiceFactory.instance, CallSuccessTypePermissions)
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

export default CallSuccessTypeController;
export {
    CallSuccessTypeController
}

