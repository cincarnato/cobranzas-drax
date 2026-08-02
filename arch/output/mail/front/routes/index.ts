
import InboundEmailCrudRoute from "./InboundEmailCrudRoute"
import MailboxCrudRoute from "./MailboxCrudRoute"
import MailboxUserSettingCrudRoute from "./MailboxUserSettingCrudRoute"
import SessionEmailCrudRoute from "./SessionEmailCrudRoute"
import OutboundEmailCrudRoute from "./OutboundEmailCrudRoute"

export const routes = [
    ...InboundEmailCrudRoute,
...MailboxCrudRoute,
...MailboxUserSettingCrudRoute,
...SessionEmailCrudRoute,
...OutboundEmailCrudRoute
]

export default routes
