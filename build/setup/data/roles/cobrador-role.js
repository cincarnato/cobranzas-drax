import { UserPermissions } from '@drax/identity-back';
import { MediaPermissions, FilePermissions } from '@drax/media-back';
import PadronPermissions from "../../../modules/afilmed/permissions/PadronPermissions.js";
import GroupZonePermissions from "../../../modules/collections/permissions/GroupZonePermissions.js";
import CovenantPermissions from "../../../modules/collections/permissions/CovenantPermissions.js";
import CallListPermissions from "../../../modules/caller/permissions/CallListPermissions.js";
import CallLogPermissions from "../../../modules/caller/permissions/CallLogPermissions.js";
import CallFailedTypePermissions from "../../../modules/caller/permissions/CallFailedTypePermissions.js";
import MultichannelPermissions from "../../../modules/caller/permissions/MultichannelPermissions.js";
import CallSuccessTypePermissions from "../../../modules/caller/permissions/CallSuccessTypePermissions.js";
import TransferEmailPermissions from "../../../modules/transferencias/permissions/TransferEmailPermissions.js";
import TransferAuditSessionPermissions from "../../../modules/transferencias/permissions/TransferAuditSessionPermissions.js";
import PayerPermissions from "../../../modules/transferencias/permissions/PayerPermissions.js";
import InboundEmailPermissions from "../../../modules/mail/permissions/InboundEmailPermissions.js";
import MailboxPermissions from "../../../modules/mail/permissions/MailboxPermissions.js";
import OutboundEmailPermissions from "../../../modules/mail/permissions/OutboundEmailPermissions.js";
import TemplateEmailPermissions from "../../../modules/mail/permissions/TemplateEmailPermissions.js";
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
        TransferEmailPermissions.Create,
        TransferAuditSessionPermissions.Manage,
        TransferAuditSessionPermissions.Create,
        TransferAuditSessionPermissions.Update,
        TransferAuditSessionPermissions.View,
        PayerPermissions.Manage,
        PayerPermissions.View,
        PayerPermissions.Create,
        PayerPermissions.Update,
        PayerPermissions.Delete,
        InboundEmailPermissions.View,
        InboundEmailPermissions.Manage,
        InboundEmailPermissions.Assign,
        InboundEmailPermissions.AssignToMe,
        InboundEmailPermissions.Reopen,
        InboundEmailPermissions.Update,
        MailboxPermissions.View,
        OutboundEmailPermissions.View,
        OutboundEmailPermissions.Create,
        TemplateEmailPermissions.View,
        TemplateEmailPermissions.Create,
        TemplateEmailPermissions.Update,
        MediaPermissions.UploadFile,
        FilePermissions.View
    ],
    childRoles: [],
    readonly: true
};
export default role;
