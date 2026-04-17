
import CallLogCrudPage from "../pages/crud/CallLogCrudPage.vue";


const CallLogCrudRoute = [
  {
    name: 'CallLogCrudPage',
    path: '/crud/calllog',
    component: CallLogCrudPage,
    meta: {
      auth: true,
      permission: 'calllog:manage',
    }
  },
]

export default CallLogCrudRoute
export { CallLogCrudRoute }
