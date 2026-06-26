import TransferAuditSessionView from "../pages/TransferAuditSessionView.vue";

const TransferAuditSessionRoute = [
  {
    name: "TransferAuditSessionView",
    path: "/transfer-emails/audit-session",
    component: TransferAuditSessionView,
    meta: {
      auth: true,
      permission: "transferemail:manage",
    },
  },
];

export default TransferAuditSessionRoute;
export {TransferAuditSessionRoute};
