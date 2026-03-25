
import CovenantCrudRoute from "./CovenantCrudRoute"
import CovenantDashboardRoute from "./CovenantDashboardRoute"
import GroupZoneCrudRoute from "./GroupZoneCrudRoute"

export const routes = [
     ...CovenantDashboardRoute,
    ...CovenantCrudRoute,
    ...GroupZoneCrudRoute
]

export default routes
