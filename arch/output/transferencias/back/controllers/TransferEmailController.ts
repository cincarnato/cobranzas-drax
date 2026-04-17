
import TransferEmailServiceFactory from "../factory/services/TransferEmailServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import TransferEmailPermissions from "../permissions/TransferEmailPermissions.js";
import type {ITransferEmail, ITransferEmailBase} from "../interfaces/ITransferEmail";

class TransferEmailController extends AbstractFastifyController<ITransferEmail, ITransferEmailBase, ITransferEmailBase>   {

    constructor() {
        super(TransferEmailServiceFactory.instance, TransferEmailPermissions)
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

export default TransferEmailController;
export {
    TransferEmailController
}

