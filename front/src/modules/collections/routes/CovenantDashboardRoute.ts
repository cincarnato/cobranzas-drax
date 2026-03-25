import ConvenantDashboard from "../pages/ConvenantDashboard.vue";

const CovenantDashboardRoute = [
  {
    name: "CovenantDashboardPage",
    path: "/dashboard/covenant",
    component: ConvenantDashboard,
    meta: {
      auth: true,
      permission: "covenant:view",
    },
  },
];

export default CovenantDashboardRoute;
export {CovenantDashboardRoute};
