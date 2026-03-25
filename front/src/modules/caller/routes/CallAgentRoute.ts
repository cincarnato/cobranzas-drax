import CallAgentPage from "../pages/CallAgent.vue";

const CallAgentRoute = [
  {
    name: 'CallLogAgent',
    path: '/call/agent/:callListId',
    component: CallAgentPage,
    meta: {
      auth: true,
      permission: 'calllog:view',
    }
  },
]

export default CallAgentRoute
export { CallAgentRoute }
