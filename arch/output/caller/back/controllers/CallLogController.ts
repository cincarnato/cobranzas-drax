
import CallLogServiceFactory from "../factory/services/CallLogServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import CallLogPermissions from "../permissions/CallLogPermissions.js";
import type {ICallLog, ICallLogBase} from "../interfaces/ICallLog";

class CallLogController extends AbstractFastifyController<ICallLog, ICallLogBase, ICallLogBase>   {

    constructor() {
        super(CallLogServiceFactory.instance, CallLogPermissions)
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

export default CallLogController;
export {
    CallLogController
}

