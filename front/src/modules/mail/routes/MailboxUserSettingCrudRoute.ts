
import MailboxUserSettingCrudPage from "../pages/crud/MailboxUserSettingCrudPage.vue";


const MailboxUserSettingCrudRoute = [
  {
    name: 'MailboxUserSettingCrudPage',
    path: '/crud/mailboxusersetting',
    component: MailboxUserSettingCrudPage,
    meta: {
      auth: true,
      permission: 'mailboxusersetting:manage',
    }
  },
]

export default MailboxUserSettingCrudRoute
export { MailboxUserSettingCrudRoute }
