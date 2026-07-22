
import InboundEmailCrudRoute from "./InboundEmailCrudRoute"
import MailboxCrudRoute from "./MailboxCrudRoute"
import OutboundEmailCrudRoute from "./OutboundEmailCrudRoute"

export const routes = [
    ...InboundEmailCrudRoute,
...MailboxCrudRoute,
...OutboundEmailCrudRoute
]

export default routes
