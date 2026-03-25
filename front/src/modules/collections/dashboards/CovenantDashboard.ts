import type {IDashboardBase} from "@drax/dashboard-share";

function createCovenantDashboard(): IDashboardBase {
  return {
    identifier: "covenant-dashboard",
    title: "Dashboard de Convenios",
    cards: [
      {
        entity: "Covenant",
        type: "groupBy",
        title: "Resumen por zona",
        filters: [],
        layout: {
          cols: 12,
          sm: 12,
          md: 6,
          lg: 6,
          height: 420,
          cardVariant: "outlined",
        },
        groupBy: {
          fields: ["group", "amount"],
          render: "table",
        },
      },
      {
        entity: "Covenant",
        type: "groupBy",
        title: "Resumen por usuario",
        filters: [],
        layout: {
          cols: 12,
          sm: 12,
          md: 6,
          lg: 6,
          height: 420,
          cardVariant: "outlined",
        },
        groupBy: {
          fields: ["createdBy", "amount"],
          render: "table",
        },
      },
    ],
  };
}

export {createCovenantDashboard};
export default createCovenantDashboard;
