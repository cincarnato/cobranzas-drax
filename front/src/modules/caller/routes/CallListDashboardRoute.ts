import CallListDashboardPage from "../pages/CallListDashboardPage.vue";

const CallListDashboardRoute = [
  {
    name: 'CallListDashboardPage',
    path: '/dashboard/call-lists',
    component: CallListDashboardPage,
    meta: {
      auth: true,
      permission: 'calllist:view',
    }
  },
]

export default CallListDashboardRoute
export {CallListDashboardRoute}
