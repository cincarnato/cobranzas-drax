
import InternalTransferBonusCrudRoute from "./InternalTransferBonusCrudRoute"
import InternalTransferBonusDashboardRoute from "./InternalTransferBonusDashboardRoute"
import InternalTransferBonusExportRoute from "./InternalTransferBonusExportRoute"

export const routes = [
    ...InternalTransferBonusCrudRoute,
    ...InternalTransferBonusDashboardRoute,
    ...InternalTransferBonusExportRoute
]

export default routes
