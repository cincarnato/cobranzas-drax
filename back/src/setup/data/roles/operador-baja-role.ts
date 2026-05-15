import BonusPermissions from "../../../modules/bajas/permissions/BonusPermissions.js";

const role = {
    name: "OperadorBaja",
    permissions: [
        BonusPermissions.View,
        BonusPermissions.Create,
        BonusPermissions.Update,
    ],
    childRoles: [],
    readonly: true
}

export default role
