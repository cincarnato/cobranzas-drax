
import CallListCrudPage from "../pages/crud/CallListCrudPage.vue";


const CallListCrudRoute = [
  {
    name: 'CallListCrudPage',
    path: '/crud/calllist',
    component: CallListCrudPage,
    meta: {
      auth: true,
      permission: 'calllist:manage',
    }
  },
]

export default CallListCrudRoute
export { CallListCrudRoute }
