
import InternalTransferBonusServiceFactory from "../factory/services/InternalTransferBonusServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import InternalTransferBonusPermissions from "../permissions/InternalTransferBonusPermissions.js";
import type {IInternalTransferBonus, IInternalTransferBonusBase} from "../interfaces/IInternalTransferBonus";

class InternalTransferBonusController extends AbstractFastifyController<IInternalTransferBonus, IInternalTransferBonusBase, IInternalTransferBonusBase>   {

    constructor() {
        super(InternalTransferBonusServiceFactory.instance, InternalTransferBonusPermissions)
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

export default InternalTransferBonusController;
export {
    InternalTransferBonusController
}

