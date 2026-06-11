import InboundEmailDashboardPage from "../pages/InboundEmailDashboardPage.vue";

const InboundEmailDashboardRoute = [
  {
    name: "InboundEmailDashboardPage",
    path: "/dashboard/inbound-emails",
    component: InboundEmailDashboardPage,
    meta: {
      auth: true,
      permission: "inboundemail:view",
    },
  },
];

export default InboundEmailDashboardRoute;
export {InboundEmailDashboardRoute};
