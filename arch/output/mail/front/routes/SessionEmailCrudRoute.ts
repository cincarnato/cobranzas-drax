
import SessionEmailCrudPage from "../pages/crud/SessionEmailCrudPage.vue";


const SessionEmailCrudRoute = [
  {
    name: 'SessionEmailCrudPage',
    path: '/crud/sessionemail',
    component: SessionEmailCrudPage,
    meta: {
      auth: true,
      permission: 'sessionemail:manage',
    }
  },
]

export default SessionEmailCrudRoute
export { SessionEmailCrudRoute }
