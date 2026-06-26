
import BankMovementCrudRoute from "./BankMovementCrudRoute"
import PayerCrudRoute from "./PayerCrudRoute"
import TransferEmailProcessRoute from "./TransferEmailProcessRoute"
import TransferEmailCrudRoute from "./TransferEmailCrudRoute"
import TransferEmailViewRoute from "./TransferEmailViewRoute"
import TransferEmailDashboardRoute from "./TransferEmailDashboardRoute"
import TransferAuditSessionRoute from "./TransferAuditSessionRoute"

export const routes = [
...BankMovementCrudRoute,
...PayerCrudRoute,
...TransferEmailProcessRoute,
...TransferEmailCrudRoute,
...TransferEmailViewRoute,
...TransferEmailDashboardRoute,
...TransferAuditSessionRoute
]

export default routes
