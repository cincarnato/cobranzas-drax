import GroupZonePermissions from "../../../modules/collections/permissions/GroupZonePermissions.js";

import CallListPermissions from "../../../modules/caller/permissions/CallListPermissions.js";
import CallLogPermissions from "../../../modules/caller/permissions/CallLogPermissions.js";
import CallFailedTypePermissions from "../../../modules/caller/permissions/CallFailedTypePermissions.js";
import CallSuccessTypePermissions from "../../../modules/caller/permissions/CallSuccessTypePermissions.js";

const role = {
    name: "Llamador",
    permissions: [
        GroupZonePermissions.View,


        CallListPermissions.View,

        CallLogPermissions.View,
        CallLogPermissions.Update,

        CallFailedTypePermissions.View,
        CallSuccessTypePermissions.View
    ],
    childRoles: [],
    readonly: true
}

export default role
