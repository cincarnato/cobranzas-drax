
import TypificationEmailServiceFactory from "../factory/services/TypificationEmailServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import TypificationEmailPermissions from "../permissions/TypificationEmailPermissions.js";
import type {ITypificationEmail, ITypificationEmailBase} from "../interfaces/ITypificationEmail";

class TypificationEmailController extends AbstractFastifyController<ITypificationEmail, ITypificationEmailBase, ITypificationEmailBase>   {

    constructor() {
        super(TypificationEmailServiceFactory.instance, TypificationEmailPermissions)
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

export default TypificationEmailController;
export {
    TypificationEmailController
}

