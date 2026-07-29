import BonusPermissions from "../../../modules/bajas/permissions/BonusPermissions.js";
import InternalTransferBonusPermissions from "../../../modules/traspasosInternos/permissions/InternalTransferBonusPermissions.js";

const role = {
    name: "OperadorBaja",
    permissions: [
        BonusPermissions.Manage,
        BonusPermissions.View,
        BonusPermissions.Create,
        BonusPermissions.Update,

        InternalTransferBonusPermissions.Manage,
        InternalTransferBonusPermissions.Create,
        InternalTransferBonusPermissions.Update,
        InternalTransferBonusPermissions.View
    ],
    childRoles: [],
    readonly: true
}

export default role
