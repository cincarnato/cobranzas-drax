
import BankMovementCrudRoute from "./BankMovementCrudRoute"
import PayerCrudRoute from "./PayerCrudRoute"
import TransferEmailProcessRoute from "./TransferEmailProcessRoute"
import TransferEmailCrudRoute from "./TransferEmailCrudRoute"
import TransferEmailViewRoute from "./TransferEmailViewRoute"
import TransferEmailDashboardRoute from "./TransferEmailDashboardRoute"
import TransferAuditSessionRoute from "./TransferAuditSessionRoute"
import InboundEmailTransferManagementRoute from "./InboundEmailTransferManagementRoute"

export const routes = [
...BankMovementCrudRoute,
...PayerCrudRoute,
...TransferEmailProcessRoute,
...TransferEmailCrudRoute,
...TransferEmailViewRoute,
...TransferEmailDashboardRoute,
...TransferAuditSessionRoute,
...InboundEmailTransferManagementRoute
]

export default routes
