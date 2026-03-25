
import GroupZoneServiceFactory from "../factory/services/GroupZoneServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import GroupZonePermissions from "../permissions/GroupZonePermissions.js";
import type {IGroupZone, IGroupZoneBase} from "../interfaces/IGroupZone";

class GroupZoneController extends AbstractFastifyController<IGroupZone, IGroupZoneBase, IGroupZoneBase>   {

    constructor() {
        super(GroupZoneServiceFactory.instance, GroupZonePermissions)
        this.tenantField = "tenant";
        this.userField = "users";

        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;

        this.userFilter = true;
        this.userSetter = false;
        this.userAssert = false;
    }

}

export default GroupZoneController;
export {
    GroupZoneController
}

