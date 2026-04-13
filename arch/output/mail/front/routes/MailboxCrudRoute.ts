
import MailboxCrudPage from "../pages/crud/MailboxCrudPage.vue";


const MailboxCrudRoute = [
  {
    name: 'MailboxCrudPage',
    path: '/crud/mailbox',
    component: MailboxCrudPage,
    meta: {
      auth: true,
      permission: 'mailbox:manage',
    }
  },
]

export default MailboxCrudRoute
export { MailboxCrudRoute }
