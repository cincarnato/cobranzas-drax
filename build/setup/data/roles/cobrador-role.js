import { UserPermissions } from '@drax/identity-back';
import PadronPermissions from "../../../modules/afilmed/permissions/PadronPermissions.js";
import GroupZonePermissions from "../../../modules/collections/permissions/GroupZonePermissions.js";
import CovenantPermissions from "../../../modules/collections/permissions/CovenantPermissions.js";
import CallListPermissions from "../../../modules/caller/permissions/CallListPermissions.js";
import CallLogPermissions from "../../../modules/caller/permissions/CallLogPermissions.js";
import CallFailedTypePermissions from "../../../modules/caller/permissions/CallFailedTypePermissions.js";
import MultichannelPermissions from "../../../modules/caller/permissions/MultichannelPermissions.js";
import CallSuccessTypePermissions from "../../../modules/caller/permissions/CallSuccessTypePermissions.js";
import TransferEmailPermissions from "../../../modules/transferencias/permissions/TransferEmailPermissions.js";
import PayerPermissions from "../../../modules/transferencias/permissions/PayerPermissions.js";
import InboundEmailPermissions from "../../../modules/mail/permissions/InboundEmailPermissions.js";
const role = {
    name: "Cobrador",
    permissions: [
        UserPermissions.View,
        UserPermissions.Manage,
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
        MultichannelPermissions.SendWhatsappTemplate,
        CallFailedTypePermissions.View,
        CallSuccessTypePermissions.View,
        TransferEmailPermissions.View,
        TransferEmailPermissions.Manage,
        TransferEmailPermissions.Update,
        PayerPermissions.Manage,
        PayerPermissions.View,
        PayerPermissions.Create,
        PayerPermissions.Update,
        PayerPermissions.Delete,
        InboundEmailPermissions.View,
        InboundEmailPermissions.Manage,
    ],
    childRoles: [],
    readonly: true
};
export default role;
