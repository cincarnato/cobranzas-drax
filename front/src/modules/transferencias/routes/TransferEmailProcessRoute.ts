import TransferEmailProcessPage from "../pages/TransferEmailProcessPage.vue";

const TransferEmailProcessRoute = [
  {
    name: "TransferEmailProcessPage",
    path: "/transferencias/process-inbound-emails",
    component: TransferEmailProcessPage,
    meta: {
      auth: true,
      permission: "transferemail:manage",
    }
  },
];

export default TransferEmailProcessRoute;
export { TransferEmailProcessRoute };
