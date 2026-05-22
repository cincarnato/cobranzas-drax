import CallAttemptServiceFactory from "../factory/services/CallAttemptServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import CallAttemptPermissions from "../permissions/CallAttemptPermissions.js";
import type {ICallAttempt, ICallAttemptBase} from "../interfaces/ICallAttempt";

class CallAttemptController extends AbstractFastifyController<ICallAttempt, ICallAttemptBase, ICallAttemptBase>   {

    constructor() {
        super(CallAttemptServiceFactory.instance, CallAttemptPermissions)
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

export default CallAttemptController;
export {
    CallAttemptController
}
