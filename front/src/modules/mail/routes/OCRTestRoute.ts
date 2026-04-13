import OCRTestPage from "../pages/OCRTestPage.vue";

const OCRTestRoute = [
  {
    name: "OCRTestPage",
    path: "/mail/ocr-test",
    component: OCRTestPage,
    meta: {
      auth: true,
      permission: "mailbox:manage",
    }
  },
];

export default OCRTestRoute;
export { OCRTestRoute };
