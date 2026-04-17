import { LoadPermissions } from "@drax/identity-back";
import {
    UserPermissions,
    RolePermissions,
    TenantPermissions,
    UserApiKeyPermissions,
    UserLoginFailPermissions,
    UserSessionPermissions
} from "@drax/identity-back";
import { MediaPermissions, FilePermissions} from "@drax/media-back";
import { SettingPermissions } from "@drax/settings-back";
import { DashboardPermissions } from "@drax/dashboard-back";
import { AuditPermissions } from "@drax/audit-back";

import { BasePermissions } from "../modules/base/permissions/BasePermissions.js";
import { NotificationPermissions } from "../modules/base/permissions/NotificationPermissions.js";
import { PadronPermissions } from "../modules/afilmed/permissions/PadronPermissions.js";
import { CallFailedTypePermissions } from "../modules/caller/permissions/CallFailedTypePermissions.js";
import { CallListPermissions } from "../modules/caller/permissions/CallListPermissions.js";
import { CallLogPermissions } from "../modules/caller/permissions/CallLogPermissions.js";
import { CallSuccessTypePermissions } from "../modules/caller/permissions/CallSuccessTypePermissions.js";
import { CovenantPermissions } from "../modules/collections/permissions/CovenantPermissions.js";
import { GroupZonePermissions } from "../modules/collections/permissions/GroupZonePermissions.js";
import { InboundEmailPermissions } from "../modules/mail/permissions/InboundEmailPermissions.js";
import { MailboxPermissions } from "../modules/mail/permissions/MailboxPermissions.js";
import { BankMovementPermissions } from "../modules/transferencias/permissions/BankMovementPermissions.js";
import { PayerEntityPermissions } from "../modules/transferencias/permissions/PayerEntityPermissions.js";
import { TransferEmailPermissions } from "../modules/transferencias/permissions/TransferEmailPermissions.js";
import { AffiliatePermissions } from "../modules/premedic/permissions/AffiliatePermissions.js";
import { AffiliateTypePermissions } from "../modules/premedic/permissions/AffiliateTypePermissions.js";

function InitializePermissions() {

    //Merge All Permissions
    const permissions = [
        ...Object.values(UserPermissions),
        ...Object.values(RolePermissions),
        ...Object.values(TenantPermissions),
        ...Object.values(UserApiKeyPermissions),
        ...Object.values(UserLoginFailPermissions),
        ...Object.values(UserSessionPermissions),
        ...Object.values(MediaPermissions),
        ...Object.values(FilePermissions),
        ...Object.values(SettingPermissions),
        ...Object.values(DashboardPermissions),
        ...Object.values(AuditPermissions),

        //Local modules permissions
        ...Object.values(BasePermissions),
        ...Object.values(NotificationPermissions),
        ...Object.values(PadronPermissions),
        ...Object.values(CallFailedTypePermissions),
        ...Object.values(CallListPermissions),
        ...Object.values(CallLogPermissions),
        ...Object.values(CallSuccessTypePermissions),
        ...Object.values(CovenantPermissions),
        ...Object.values(GroupZonePermissions),
        ...Object.values(InboundEmailPermissions),
        ...Object.values(MailboxPermissions),
        ...Object.values(AffiliatePermissions),
        ...Object.values(AffiliateTypePermissions),
        ...Object.values(BankMovementPermissions),
        ...Object.values(PayerEntityPermissions),
        ...Object.values(TransferEmailPermissions),
    ]

    //Load All Permissions
    LoadPermissions(permissions)
}

export default InitializePermissions

export { InitializePermissions }
