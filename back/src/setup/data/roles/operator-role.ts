import GroupZonePermissions from "../../../modules/collections/permissions/GroupZonePermissions.js";
import CovenantPermissions from "../../../modules/collections/permissions/CovenantPermissions.js";

const role = {
    name: "Operator",
    permissions: [
        GroupZonePermissions.View,
        CovenantPermissions.Manage,
        CovenantPermissions.Create,
        CovenantPermissions.View,
        CovenantPermissions.Update,
        CovenantPermissions.Delete
    ],
    childRoles: [],
    readonly: true
}

export default role
