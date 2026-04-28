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
        this.userFilter = false;
        this.userSetter = false;
        this.userAssert = false;
    }
    async preRead(request, filters) {
        const userId = request.rbac.userId;
        filters.push({ field: this.userField, operator: "eq", value: userId });
        return filters;
    }
}
export default GroupZoneController;
export { GroupZoneController };
