
import BankMovementServiceFactory from "../factory/services/BankMovementServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import BankMovementPermissions from "../permissions/BankMovementPermissions.js";
import type {IBankMovement, IBankMovementBase} from "../interfaces/IBankMovement";

class BankMovementController extends AbstractFastifyController<IBankMovement, IBankMovementBase, IBankMovementBase>   {

    constructor() {
        super(BankMovementServiceFactory.instance, BankMovementPermissions)
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

export default BankMovementController;
export {
    BankMovementController
}

