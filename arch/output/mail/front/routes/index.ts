
import InboundEmailCrudRoute from "./InboundEmailCrudRoute"
import MailboxCrudRoute from "./MailboxCrudRoute"

export const routes = [
    ...InboundEmailCrudRoute,
...MailboxCrudRoute
]

export default routes
