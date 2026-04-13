
import CallFailedTypeCrudRoute from "./CallFailedTypeCrudRoute"
import CallListCrudRoute from "./CallListCrudRoute"
import CallLogCrudRoute from "./CallLogCrudRoute"
import CallSuccessTypeCrudRoute from "./CallSuccessTypeCrudRoute"

export const routes = [
    ...CallFailedTypeCrudRoute,
...CallListCrudRoute,
...CallLogCrudRoute,
...CallSuccessTypeCrudRoute
]

export default routes
