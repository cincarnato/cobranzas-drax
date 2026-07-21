
import InboundEmailCrudRoute from "./InboundEmailCrudRoute"
import MailboxCrudRoute from "./MailboxCrudRoute"
import OutboundEmailCrudRoute from "./OutboundEmailCrudRoute"
import TypificationEmailCrudRoute from "./TypificationEmailCrudRoute"

export const routes = [
    ...InboundEmailCrudRoute,
...MailboxCrudRoute,
...OutboundEmailCrudRoute,
...TypificationEmailCrudRoute
]

export default routes
