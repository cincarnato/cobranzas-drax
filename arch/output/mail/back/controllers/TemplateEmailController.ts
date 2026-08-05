
import TemplateEmailServiceFactory from "../factory/services/TemplateEmailServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import TemplateEmailPermissions from "../permissions/TemplateEmailPermissions.js";
import type {ITemplateEmail, ITemplateEmailBase} from "../interfaces/ITemplateEmail";

class TemplateEmailController extends AbstractFastifyController<ITemplateEmail, ITemplateEmailBase, ITemplateEmailBase>   {

    constructor() {
        super(TemplateEmailServiceFactory.instance, TemplateEmailPermissions)
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

export default TemplateEmailController;
export {
    TemplateEmailController
}

