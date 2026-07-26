
import OutboundEmailCrudPage from "../pages/crud/OutboundEmailCrudPage.vue";


const OutboundEmailCrudRoute = [
  {
    name: 'OutboundEmailCrudPage',
    path: '/crud/outboundemail',
    component: OutboundEmailCrudPage,
    meta: {
      auth: true,
      permission: 'outboundemail:manage',
    }
  },
]

export default OutboundEmailCrudRoute
export { OutboundEmailCrudRoute }
