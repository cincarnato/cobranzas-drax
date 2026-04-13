
import CallSuccessTypeCrudPage from "../pages/crud/CallSuccessTypeCrudPage.vue";


const CallSuccessTypeCrudRoute = [
  {
    name: 'CallSuccessTypeCrudPage',
    path: '/crud/callsuccesstype',
    component: CallSuccessTypeCrudPage,
    meta: {
      auth: true,
      permission: 'callsuccesstype:manage',
    }
  },
]

export default CallSuccessTypeCrudRoute
export { CallSuccessTypeCrudRoute }
