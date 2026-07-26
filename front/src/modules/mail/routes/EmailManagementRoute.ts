import EmailManagementPage from "../pages/EmailManagementPage.vue";

const EmailManagementRoute = [
  {
    name: "EmailManagementPage",
    path: "/mail/management",
    component: EmailManagementPage,
    meta: {
      auth: true,
      permission: "inboundemail:view",
    },
  },
];

export default EmailManagementRoute;
export {EmailManagementRoute};
