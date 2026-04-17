
import CallFailedTypeCrudPage from "../pages/crud/CallFailedTypeCrudPage.vue";


const CallFailedTypeCrudRoute = [
  {
    name: 'CallFailedTypeCrudPage',
    path: '/crud/callfailedtype',
    component: CallFailedTypeCrudPage,
    meta: {
      auth: true,
      permission: 'callfailedtype:manage',
    }
  },
]

export default CallFailedTypeCrudRoute
export { CallFailedTypeCrudRoute }
