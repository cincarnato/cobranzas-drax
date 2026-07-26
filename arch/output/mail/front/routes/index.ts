
import InboundEmailCrudRoute from "./InboundEmailCrudRoute"
import MailboxCrudRoute from "./MailboxCrudRoute"
import SessionEmailCrudRoute from "./SessionEmailCrudRoute"
import OutboundEmailCrudRoute from "./OutboundEmailCrudRoute"

export const routes = [
    ...InboundEmailCrudRoute,
...MailboxCrudRoute,
...SessionEmailCrudRoute,
...OutboundEmailCrudRoute
]

export default routes
