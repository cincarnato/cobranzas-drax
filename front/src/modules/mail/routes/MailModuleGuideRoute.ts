import MailModuleGuidePage from "../pages/MailModuleGuidePage.vue";

const MailModuleGuideRoute = [
  {
    name: "MailModuleGuidePage",
    path: "/mail/guide",
    component: MailModuleGuidePage,
    meta: {
      auth: true,
      permission: "inboundemail:view",
    },
  },
];

export default MailModuleGuideRoute;
export {MailModuleGuideRoute};
