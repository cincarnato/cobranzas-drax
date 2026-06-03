
import BonusCrudRoute from "./BonusCrudRoute"
import BonusExportRoute from "./BonusExportRoute"
import BonusDashboardRoute from "./BonusDashboardRoute"

export const routes = [
    ...BonusCrudRoute,
    ...BonusExportRoute,
    ...BonusDashboardRoute
]

export default routes
