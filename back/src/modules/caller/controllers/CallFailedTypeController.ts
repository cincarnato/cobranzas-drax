
import CallFailedTypeServiceFactory from "../factory/services/CallFailedTypeServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import CallFailedTypePermissions from "../permissions/CallFailedTypePermissions.js";
import type {ICallFailedType, ICallFailedTypeBase} from "../interfaces/ICallFailedType";

class CallFailedTypeController extends AbstractFastifyController<ICallFailedType, ICallFailedTypeBase, ICallFailedTypeBase>   {

    constructor() {
        super(CallFailedTypeServiceFactory.instance, CallFailedTypePermissions)
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

export default CallFailedTypeController;
export {
    CallFailedTypeController
}

