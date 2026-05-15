import BonusPermissions from "../../../modules/bajas/permissions/BonusPermissions.js";
const role = {
    name: "SupervisorBaja",
    permissions: [
        BonusPermissions.View,
        BonusPermissions.ViewAll,
        BonusPermissions.Create,
        BonusPermissions.Update,
        BonusPermissions.Export,
    ],
    childRoles: [],
    readonly: true
};
export default role;
