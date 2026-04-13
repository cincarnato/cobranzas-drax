import InboundEmailViewPage from "../pages/InboundEmailViewPage.vue";

const InboundEmailViewRoute = [
  {
    name: "InboundEmailViewPage",
    path: "/mail/inbound-email/:inboundEmailId",
    component: InboundEmailViewPage,
    meta: {
      auth: true,
      permission: "inboundemail:view",
    }
  },
];

export default InboundEmailViewRoute;
export { InboundEmailViewRoute };
