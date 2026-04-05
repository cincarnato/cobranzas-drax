
import CallListServiceFactory from "../factory/services/CallListServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import CallListPermissions from "../permissions/CallListPermissions.js";
import type {ICallList, ICallListBase} from "../interfaces/ICallList";
import {IDraxFieldFilter} from "@drax/crud-share";
import GroupZoneServiceFactory from "../../collections/factory/services/GroupZoneServiceFactory.js";

class CallListController extends AbstractFastifyController<ICallList, ICallListBase, ICallListBase>   {

    constructor() {
        super(CallListServiceFactory.instance, CallListPermissions)
        this.tenantField = "tenant";
        this.userField = "user";

        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;

        this.userFilter = false;
        this.userSetter = false;
        this.userAssert = false;
    }

    //Necesito un interceptor prePaginate preFind para poder personalizar filtros de user or group
    async preRead(request: any, filters: IDraxFieldFilter[]): Promise<IDraxFieldFilter[]> {
        if(request.rbac.hasPermission(CallListPermissions.View) && !request.rbac.hasPermission(CallListPermissions.ViewAll)){
            const userId = request.rbac.userId;
            const groupFilters = [{field: 'users', operator: 'in', value: userId}]
            const userGroups = await GroupZoneServiceFactory.instance.find({filters: groupFilters})
            const userGroupsId = userGroups.map(group => group._id.toString());
            filters.push({field: "user", operator: "eq", value: userId, orGroup: 'operator'});
            filters.push({field: "group", operator: "in", value: userGroupsId, orGroup: 'operator'});

        }
        console.log("final filters",filters);
        return filters;
    }

}

export default CallListController;
export {
    CallListController
}

