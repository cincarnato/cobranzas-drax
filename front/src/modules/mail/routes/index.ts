
import InboundEmailCrudRoute from "./InboundEmailCrudRoute"
import OCRTestRoute from "./OCRTestRoute"
import InboundEmailSyncRoute from "./InboundEmailSyncRoute"
import InboundEmailViewRoute from "./InboundEmailViewRoute"
import MailboxCrudRoute from "./MailboxCrudRoute"
import InboundEmailDashboardRoute from "./InboundEmailDashboardRoute"
import OutboundEmailCrudRoute from "./OutboundEmailCrudRoute"
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
    ...InboundEmailDashboardRoute,
    ...OutboundEmailCrudRoute
]

export default routes
