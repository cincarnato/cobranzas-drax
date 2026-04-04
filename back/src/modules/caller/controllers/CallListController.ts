
import CallListServiceFactory from "../factory/services/CallListServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import CallListPermissions from "../permissions/CallListPermissions.js";
import type {ICallList, ICallListBase} from "../interfaces/ICallList";

class CallListController extends AbstractFastifyController<ICallList, ICallListBase, ICallListBase>   {

    constructor() {
        super(CallListServiceFactory.instance, CallListPermissions)
        this.tenantField = "tenant";
        this.userField = "user";

        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;

        this.userFilter = true;
        this.userSetter = false;
        this.userAssert = true;
    }

    //Necesito un interceptor prePaginate preFind para poder personalizar filtros de user or group

}

export default CallListController;
export {
    CallListController
}

