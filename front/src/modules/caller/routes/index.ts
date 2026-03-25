import CallAgentRoute from "./CallAgentRoute"
import CallFailedTypeCrudRoute from "./CallFailedTypeCrudRoute"
import CallListDashboardRoute from "./CallListDashboardRoute"
import CallListCrudRoute from "./CallListCrudRoute"
import CallLogCrudRoute from "./CallLogCrudRoute"
import CallSuccessTypeCrudRoute from "./CallSuccessTypeCrudRoute"

export const routes = [
    ...CallAgentRoute,
...CallListDashboardRoute,
...CallFailedTypeCrudRoute,
...CallListCrudRoute,
...CallLogCrudRoute,
...CallSuccessTypeCrudRoute
]

export default routes
