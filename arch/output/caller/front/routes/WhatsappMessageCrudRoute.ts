
import WhatsappMessageCrudPage from "../pages/crud/WhatsappMessageCrudPage.vue";


const WhatsappMessageCrudRoute = [
  {
    name: 'WhatsappMessageCrudPage',
    path: '/crud/whatsappmessage',
    component: WhatsappMessageCrudPage,
    meta: {
      auth: true,
      permission: 'whatsappmessage:manage',
    }
  },
]

export default WhatsappMessageCrudRoute
export { WhatsappMessageCrudRoute }
