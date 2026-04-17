import { UserPermissions } from '@drax/identity-back';
import PadronPermissions from "../../../modules/afilmed/permissions/PadronPermissions.js";
import GroupZonePermissions from "../../../modules/collections/permissions/GroupZonePermissions.js";
import CovenantPermissions from "../../../modules/collections/permissions/CovenantPermissions.js";
import CallListPermissions from "../../../modules/caller/permissions/CallListPermissions.js";
import CallLogPermissions from "../../../modules/caller/permissions/CallLogPermissions.js";
import CallFailedTypePermissions from "../../../modules/caller/permissions/CallFailedTypePermissions.js";
import CallSuccessTypePermissions from "../../../modules/caller/permissions/CallSuccessTypePermissions.js";
const role = {
    name: "Cobrador",
    permissions: [
        UserPermissions.View,
        GroupZonePermissions.View,
        PadronPermissions.Manage,
        PadronPermissions.Create,
        PadronPermissions.View,
        PadronPermissions.Update,
        PadronPermissions.Delete,
        CovenantPermissions.Manage,
        CovenantPermissions.Create,
        CovenantPermissions.View,
        CovenantPermissions.Update,
        CovenantPermissions.Delete,
        CallListPermissions.View,
        CallLogPermissions.View,
        CallLogPermissions.Update,
        CallFailedTypePermissions.View,
        CallSuccessTypePermissions.View,
    ],
    childRoles: [],
    readonly: true
};
export default role;
