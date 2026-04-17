
import CovenantServiceFactory from "../factory/services/CovenantServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import CovenantPermissions from "../permissions/CovenantPermissions.js";
import type {ICovenant, ICovenantBase} from "../interfaces/ICovenant";

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

}

export default CovenantController;
export {
    CovenantController
}

