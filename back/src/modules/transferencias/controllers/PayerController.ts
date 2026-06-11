
import PayerServiceFactory from "../factory/services/PayerServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import PayerPermissions from "../permissions/PayerPermissions.js";
import type {IPayer, IPayerBase} from "../interfaces/IPayer";

class PayerController extends AbstractFastifyController<IPayer, IPayerBase, IPayerBase>   {

    constructor() {
        super(PayerServiceFactory.instance, PayerPermissions)
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

export default PayerController;
export {
    PayerController
}

