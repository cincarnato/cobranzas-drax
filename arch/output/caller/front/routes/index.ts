
import CallFailedTypeCrudRoute from "./CallFailedTypeCrudRoute"
import CallListCrudRoute from "./CallListCrudRoute"
import CallLogCrudRoute from "./CallLogCrudRoute"
import CallSuccessTypeCrudRoute from "./CallSuccessTypeCrudRoute"
import WhatsappMessageCrudRoute from "./WhatsappMessageCrudRoute"

export const routes = [
    ...CallFailedTypeCrudRoute,
...CallListCrudRoute,
...CallLogCrudRoute,
...CallSuccessTypeCrudRoute,
...WhatsappMessageCrudRoute
]

export default routes
