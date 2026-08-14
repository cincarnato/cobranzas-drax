import BonusPermissions from "../../../modules/bajas/permissions/BonusPermissions.js";
import InternalTransferBonusPermissions from "../../../modules/traspasosInternos/permissions/InternalTransferBonusPermissions.js";
import { MediaPermissions, FilePermissions } from "@drax/media-back";
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
        InternalTransferBonusPermissions.View,
        MediaPermissions.UploadFile,
        FilePermissions.View,
    ],
    childRoles: [],
    readonly: true
};
export default role;
