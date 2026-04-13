
import BankMovementCrudPage from "../pages/crud/BankMovementCrudPage.vue";


const BankMovementCrudRoute = [
  {
    name: 'BankMovementCrudPage',
    path: '/crud/bankmovement',
    component: BankMovementCrudPage,
    meta: {
      auth: true,
      permission: 'bankmovement:manage',
    }
  },
]

export default BankMovementCrudRoute
export { BankMovementCrudRoute }
