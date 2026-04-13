
import InboundEmailCrudPage from "../pages/crud/InboundEmailCrudPage.vue";


const InboundEmailCrudRoute = [
  {
    name: 'InboundEmailCrudPage',
    path: '/crud/inboundemail',
    component: InboundEmailCrudPage,
    meta: {
      auth: true,
      permission: 'inboundemail:manage',
    }
  },
]

export default InboundEmailCrudRoute
export { InboundEmailCrudRoute }
