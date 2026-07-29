import InternalTransferBonusDashboardPage from "../pages/InternalTransferBonusDashboardPage.vue";

const InternalTransferBonusDashboardRoute = [
  {
    name: "InternalTransferBonusDashboardPage",
    path: "/dashboard/internal-transfer-bonus",
    component: InternalTransferBonusDashboardPage,
    meta: {
      auth: true,
      permission: "internaltransferbonus:view",
    },
  },
];

export default InternalTransferBonusDashboardRoute;
export {InternalTransferBonusDashboardRoute};
