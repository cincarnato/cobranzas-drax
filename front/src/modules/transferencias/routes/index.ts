
import BankMovementCrudRoute from "./BankMovementCrudRoute"
import PayerEntityCrudRoute from "./PayerEntityCrudRoute"
import TransferEmailProcessRoute from "./TransferEmailProcessRoute"
import TransferEmailCrudRoute from "./TransferEmailCrudRoute"
import TransferEmailViewRoute from "./TransferEmailViewRoute"
import TransferEmailDashboardRoute from "./TransferEmailDashboardRoute"

export const routes = [
...BankMovementCrudRoute,
...PayerEntityCrudRoute,
...TransferEmailProcessRoute,
...TransferEmailCrudRoute,
...TransferEmailViewRoute,
...TransferEmailDashboardRoute
]

export default routes
