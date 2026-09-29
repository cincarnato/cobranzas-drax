import TransferReceiptTestPage from "../pages/TransferReceiptTestPage.vue";

const TransferReceiptTestRoute = [
  {
    name: "TransferReceiptTestPage",
    path: "/transferencias/informar-pago-test",
    component: TransferReceiptTestPage,
    meta: {
      auth: false,
    },
  },
];

export default TransferReceiptTestRoute;
export {TransferReceiptTestRoute};
