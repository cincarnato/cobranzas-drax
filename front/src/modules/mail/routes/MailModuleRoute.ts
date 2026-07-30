import MailModulePage from "../pages/MailModulePage.vue";

const MailModuleRoute = [
  {
    name: "MailModulePage",
    path: "/mail",
    component: MailModulePage,
    meta: {
      auth: true,
    },
  },
];

export default MailModuleRoute;
export {MailModuleRoute};
