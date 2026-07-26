import InboundEmailTransferManagementPage from "../pages/InboundEmailTransferManagementPage.vue";

const InboundEmailTransferManagementRoute = [
  {
    name: "InboundEmailTransferManagementPage",
    path: "/transferencias/procesar-email",
    component: InboundEmailTransferManagementPage,
    meta: {
      auth: true,
      permission: "transferemail:view",
    }
  },
];

export default InboundEmailTransferManagementRoute;
export { InboundEmailTransferManagementRoute };
