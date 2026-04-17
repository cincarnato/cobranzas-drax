import TransferEmailViewPage from "../pages/TransferEmailViewPage.vue";

const TransferEmailViewRoute = [
  {
    name: "TransferEmailViewPage",
    path: "/transferencias/email/:transferEmailId",
    component: TransferEmailViewPage,
    meta: {
      auth: true,
      permission: "transferemail:view",
    }
  },
];

export default TransferEmailViewRoute;
export { TransferEmailViewRoute };
