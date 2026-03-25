
import CovenantServiceFactory from "../factory/services/CovenantServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import CovenantPermissions from "../permissions/CovenantPermissions.js";
import type {ICovenant, ICovenantBase} from "../interfaces/ICovenant";
import {CustomRequest} from "@drax/crud-back/src/controllers/AbstractFastifyController";

class CovenantController extends AbstractFastifyController<ICovenant, ICovenantBase, ICovenantBase>   {

    constructor() {
        super(CovenantServiceFactory.instance, CovenantPermissions)
        this.tenantField = "tenant";
        this.userField = "createdBy";

        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;

        this.userFilter = true;
        this.userSetter = true;
        this.userAssert = true;
    }

    preCreate(request : CustomRequest, payload:any){
        payload.updatedBy = request.rbac.getAuthUser.id
        return payload
    }

    preUpdate(request : CustomRequest, payload:any){
        payload.updatedBy = request.rbac.getAuthUser.id
        return payload
    }

}

export default CovenantController;
export {
    CovenantController
}

