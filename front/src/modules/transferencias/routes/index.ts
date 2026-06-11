
import BankMovementCrudRoute from "./BankMovementCrudRoute"
import PayerCrudRoute from "./PayerCrudRoute"
import TransferEmailProcessRoute from "./TransferEmailProcessRoute"
import TransferEmailCrudRoute from "./TransferEmailCrudRoute"
import TransferEmailViewRoute from "./TransferEmailViewRoute"
import TransferEmailDashboardRoute from "./TransferEmailDashboardRoute"

export const routes = [
...BankMovementCrudRoute,
...PayerCrudRoute,
...TransferEmailProcessRoute,
...TransferEmailCrudRoute,
...TransferEmailViewRoute,
...TransferEmailDashboardRoute
]

export default routes
