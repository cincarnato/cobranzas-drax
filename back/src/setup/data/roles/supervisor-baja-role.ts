import BonusPermissions from "../../../modules/bajas/permissions/BonusPermissions.js";
import InternalTransferBonusPermissions
    from "../../../modules/traspasosInternos/permissions/InternalTransferBonusPermissions.js";
import {FilePermissions, MediaPermissions} from "@drax/media-back";

const role = {
    name: "SupervisorBaja",
    permissions: [
        BonusPermissions.View,
        BonusPermissions.ViewAll,
        BonusPermissions.Create,
        BonusPermissions.Update,
        BonusPermissions.Export,

        InternalTransferBonusPermissions.Manage,
        InternalTransferBonusPermissions.Create,
        InternalTransferBonusPermissions.Update,
        InternalTransferBonusPermissions.View,

        MediaPermissions.UploadFile,
        FilePermissions.View,
    ],
    childRoles: [],
    readonly: true
}

export default role
