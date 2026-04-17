
import TransferEmailCrudPage from "../pages/crud/TransferEmailCrudPage.vue";


const TransferEmailCrudRoute = [
  {
    name: 'TransferEmailCrudPage',
    path: '/crud/transferemail',
    component: TransferEmailCrudPage,
    meta: {
      auth: true,
      permission: 'transferemail:manage',
    }
  },
]

export default TransferEmailCrudRoute
export { TransferEmailCrudRoute }
