
import BonusServiceFactory from "../factory/services/BonusServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import BonusPermissions from "../permissions/BonusPermissions.js";
import type {IBonus, IBonusBase} from "../interfaces/IBonus";

class BonusController extends AbstractFastifyController<IBonus, IBonusBase, IBonusBase>   {

    constructor() {
        super(BonusServiceFactory.instance, BonusPermissions)
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

export default BonusController;
export {
    BonusController
}

