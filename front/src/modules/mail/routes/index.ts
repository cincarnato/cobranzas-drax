
import InboundEmailCrudRoute from "./InboundEmailCrudRoute"
import OCRTestRoute from "./OCRTestRoute"
import InboundEmailSyncRoute from "./InboundEmailSyncRoute"
import InboundEmailViewRoute from "./InboundEmailViewRoute"
import MailboxCrudRoute from "./MailboxCrudRoute"
import InboundEmailDashboardRoute from "./InboundEmailDashboardRoute"
import OutboundEmailCrudRoute from "./OutboundEmailCrudRoute"
import TypificationEmailCrudRoute from "./TypificationEmailCrudRoute"
import EmailManagementRoute from "./EmailManagementRoute"

export const routes = [
    ...EmailManagementRoute,
    ...InboundEmailCrudRoute,
    ...OCRTestRoute,
    ...InboundEmailSyncRoute,
    ...InboundEmailViewRoute,
    ...MailboxCrudRoute,
    ...InboundEmailDashboardRoute,
    ...OutboundEmailCrudRoute,
    ...TypificationEmailCrudRoute
]

export default routes
