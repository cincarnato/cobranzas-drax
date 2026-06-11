
import PayerCrudPage from "../pages/crud/PayerCrudPage.vue";


const PayerCrudRoute = [
  {
    name: 'PayerCrudPage',
    path: '/crud/payer',
    component: PayerCrudPage,
    meta: {
      auth: true,
      permission: 'payer:manage',
    }
  },
]

export default PayerCrudRoute
export { PayerCrudRoute }
