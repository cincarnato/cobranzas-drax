
import PayerEntityCrudPage from "../pages/crud/PayerEntityCrudPage.vue";


const PayerEntityCrudRoute = [
  {
    name: 'PayerEntityCrudPage',
    path: '/crud/payerentity',
    component: PayerEntityCrudPage,
    meta: {
      auth: true,
      permission: 'payerentity:manage',
    }
  },
]

export default PayerEntityCrudRoute
export { PayerEntityCrudRoute }
