import TransferEmailDashboardPage from "../pages/TransferEmailDashboardPage.vue";

const TransferEmailDashboardRoute = [
  {
    name: "TransferEmailDashboardPage",
    path: "/dashboard/transfer-emails",
    component: TransferEmailDashboardPage,
    meta: {
      auth: true,
      permission: "transferemail:view",
    },
  },
];

export default TransferEmailDashboardRoute;
export {TransferEmailDashboardRoute};
