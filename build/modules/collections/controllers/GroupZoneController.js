import GroupZoneServiceFactory from "../factory/services/GroupZoneServiceFactory.js";
import { AbstractFastifyController } from "@drax/crud-back";
import GroupZonePermissions from "../permissions/GroupZonePermissions.js";
class GroupZoneController extends AbstractFastifyController {
    constructor() {
        super(GroupZoneServiceFactory.instance, GroupZonePermissions);
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
export { GroupZoneController };
