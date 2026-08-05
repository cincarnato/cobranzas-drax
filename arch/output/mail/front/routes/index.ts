
import InboundEmailCrudRoute from "./InboundEmailCrudRoute"
import MailboxCrudRoute from "./MailboxCrudRoute"
import MailboxUserSettingCrudRoute from "./MailboxUserSettingCrudRoute"
import OutboundEmailCrudRoute from "./OutboundEmailCrudRoute"
import TemplateEmailCrudRoute from "./TemplateEmailCrudRoute"

export const routes = [
...InboundEmailCrudRoute,
...MailboxCrudRoute,
...MailboxUserSettingCrudRoute,
...OutboundEmailCrudRoute,
...TemplateEmailCrudRoute
]

export default routes
