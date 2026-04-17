import InboundEmailSyncPage from "../pages/InboundEmailSyncPage.vue";

const InboundEmailSyncRoute = [
  {
    name: "InboundEmailSyncPage",
    path: "/mail/inbound-email-sync",
    component: InboundEmailSyncPage,
    meta: {
      auth: true,
      permission: "mailbox:manage",
    }
  },
];

export default InboundEmailSyncRoute;
export { InboundEmailSyncRoute };
