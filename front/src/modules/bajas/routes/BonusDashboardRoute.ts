import BonusDashboardPage from "../pages/BonusDashboardPage.vue";

const BonusDashboardRoute = [
  {
    name: "BonusDashboardPage",
    path: "/dashboard/bonus",
    component: BonusDashboardPage,
    meta: {
      auth: true,
      permission: "bonus:view",
    },
  },
];

export default BonusDashboardRoute;
export {BonusDashboardRoute};
