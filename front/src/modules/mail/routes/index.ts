
import InboundEmailCrudRoute from "./InboundEmailCrudRoute"
import OCRTestRoute from "./OCRTestRoute"
import InboundEmailSyncRoute from "./InboundEmailSyncRoute"
import InboundEmailViewRoute from "./InboundEmailViewRoute"
import MailboxCrudRoute from "./MailboxCrudRoute"
import MailboxUserSettingCrudRoute from "./MailboxUserSettingCrudRoute"
import InboundEmailDashboardRoute from "./InboundEmailDashboardRoute"
import OutboundEmailCrudRoute from "./OutboundEmailCrudRoute"
import TemplateEmailCrudRoute from "./TemplateEmailCrudRoute"
import EmailManagementRoute from "./EmailManagementRoute"
import EmailSupervisionRoute from "./EmailSupervisionRoute"
import MailModuleRoute from "./MailModuleRoute"
import MailModuleGuideRoute from "./MailModuleGuideRoute"

export const routes = [
    ...MailModuleRoute,
    ...MailModuleGuideRoute,
    ...EmailManagementRoute,
    ...EmailSupervisionRoute,
    ...InboundEmailCrudRoute,
    ...OCRTestRoute,
    ...InboundEmailSyncRoute,
    ...InboundEmailViewRoute,
    ...MailboxCrudRoute,
    ...MailboxUserSettingCrudRoute,
    ...InboundEmailDashboardRoute,
    ...OutboundEmailCrudRoute,
    ...TemplateEmailCrudRoute
]

export default routes
