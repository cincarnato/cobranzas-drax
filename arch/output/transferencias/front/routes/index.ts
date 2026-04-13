
import BankMovementCrudRoute from "./BankMovementCrudRoute"
import PayerEntityCrudRoute from "./PayerEntityCrudRoute"
import TransferEmailCrudRoute from "./TransferEmailCrudRoute"

export const routes = [
    ...BankMovementCrudRoute,
...PayerEntityCrudRoute,
...TransferEmailCrudRoute
]

export default routes
