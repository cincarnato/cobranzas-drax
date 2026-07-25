import EmailSupervisionPage from "../pages/EmailSupervisionPage.vue";

const EmailSupervisionRoute = [
  {
    name: "EmailSupervisionPage",
    path: "/mail/supervision/email/live",
    component: EmailSupervisionPage,
    meta: {
      auth: true,
      permission: "inboundemail:manage",
    },
  },
];

export default EmailSupervisionRoute;
export {EmailSupervisionRoute};
